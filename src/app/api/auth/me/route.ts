import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { getSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validation";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

// ─── GET /api/auth/me ────────────────────────────────────────────────────────

export async function GET() {
  const session = await getSession();
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Not authenticated", undefined, 401);
  }

  const limits = await getOrgLimits(session.orgId);
  const appCount = await db.monitoredApp.count({ where: { orgId: session.orgId } });
  const userCount = await db.user.count({ where: { orgId: session.orgId } });

  // Fetch subscription once for both currentPeriodEnd and hasSubscription.
  const sub = await db.subscription.findUnique({
    where: { orgId: session.orgId },
    select: { currentPeriodEnd: true, stripeSubscriptionId: true },
  });

  // Return currentPeriodEnd when the subscription is set to cancel — billing page needs it for the warning banner.
  const currentPeriodEnd =
    limits.cancelAtPeriodEnd && sub?.currentPeriodEnd
      ? sub.currentPeriodEnd.toISOString()
      : null;

  // True when the org has an active Stripe subscription (false for LTD / one-time purchases).
  const hasSubscription = !!sub?.stripeSubscriptionId;

  return NextResponse.json({
    user: session,
    org: {
      limits: {
        ...limits,
        currentPeriodEnd,
        hasSubscription,
      },
      appCount,
      userCount,
    },
  });
}

// ─── PATCH /api/auth/me ──────────────────────────────────────────────────────

const patchSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
}).refine(
  (d) => !d.newPassword || !!d.currentPassword,
  { message: "currentPassword is required to set a new password", path: ["currentPassword"] },
).refine(
  (d) => !d.email || !!d.currentPassword,
  { message: "currentPassword is required to change your email", path: ["currentPassword"] },
);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return secret;
}

async function sendEmailChangeVerification(to: string, verifyLink: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL ?? "noreply@scantient.com";
  if (!key) {
    console.warn("[auth] RESEND_API_KEY not set. Skipping email change verification.");
    return;
  }
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px;">
      <h2>Verify your new email address</h2>
      <p>Click the link below to confirm your new email address. This link expires in 24 hours.</p>
      <p><a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;border-radius:6px;text-decoration:none;">Confirm Email Change</a></p>
      <p style="font-size:12px;color:#666;">If you didn't request this change, you can ignore this email — your address will remain unchanged.</p>
    </div>
  `;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: "Confirm your new Scantient email address", html }),
  });
  if (!res.ok) {
    console.error("[auth] Failed to send email change verification:", res.status);
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Not authenticated", undefined, 401);

  const ip = getClientIp(req);
  const rl = await checkRateLimit(`profile-update:${session.id}`, { maxAttempts: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  const { name, email, currentPassword, newPassword } = parsed.data;

  // Nothing to update
  if (!name && !email && !newPassword) {
    return errorResponse("BAD_REQUEST", "No fields to update", undefined, 400);
  }

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return errorResponse("NOT_FOUND", "User not found", undefined, 404);

  // Password verification required for email or password changes
  if ((email || newPassword) && currentPassword) {
    if (!user.passwordHash) {
      return errorResponse("BAD_REQUEST", "Password changes are not available for SSO accounts", undefined, 400);
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return errorResponse("UNAUTHORIZED", "Current password is incorrect", undefined, 401);
    }
  }

  const updates: Record<string, unknown> = {};

  if (name) {
    updates.name = name;
  }

  if (newPassword && currentPassword) {
    updates.passwordHash = await hashPassword(newPassword);
    // Bump updatedAt explicitly so existing sessions are invalidated (see auth.ts → getSession)
    updates.updatedAt = new Date();
  }

  let emailChangePending = false;

  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    // Check no other user has this email
    const conflict = await db.user.findFirst({ where: { email: email.toLowerCase() } });
    if (conflict) {
      return errorResponse("CONFLICT", "This email address is already in use", undefined, 409);
    }

    // Email changes require re-verification — send a confirmation link to the NEW address.
    // We do NOT update the email in the DB until the link is clicked.
    // The JWT payload carries: { sub: userId, purpose: "email-change", newEmail }
    const token = jwt.sign(
      { sub: user.id, purpose: "email-change", newEmail: email.toLowerCase() },
      getJwtSecret(),
      { expiresIn: "24h" },
    );
    const appUrl = process.env.NEXT_PUBLIC_URL ?? "https://scantient.com";
    const verifyLink = `${appUrl}/api/auth/confirm-email-change?token=${token}`;
    try {
      await sendEmailChangeVerification(email, verifyLink);
    } catch (err) {
      console.warn("[auth] Failed to send email change verification:", err);
    }
    emailChangePending = true;
  }

  // Apply non-email updates
  if (Object.keys(updates).length > 0) {
    await db.user.update({ where: { id: user.id }, data: updates });
  }

  return NextResponse.json({
    ok: true,
    ...(emailChangePending ? { emailChangePending: true, message: "A confirmation link has been sent to your new email address." } : {}),
  });
}
