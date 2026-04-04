import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return secret;
}

async function sendVerificationEmail(to: string, verifyLink: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL ?? "noreply@scantient.com";

  if (!key) {
    console.warn("[auth] RESEND_API_KEY not set. Skipping verification email.");
    return;
  }

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px;">
      <h2>Verify your Scantient email</h2>
      <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
      <p><a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a></p>
      <p style="font-size:12px;color:#666;">If you didn't sign up for Scantient, you can ignore this email.</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject: "Verify your Scantient email", html }),
  });

  if (!res.ok) {
    console.error("[auth] Failed to send verification email via Resend:", res.status, await res.text().catch(() => ""));
  }
}

/**
 * POST /api/auth/resend-verification
 *
 * Resends the email verification link for an unverified account.
 * Always returns 200 regardless of whether the email exists to prevent enumeration.
 *
 * Rate limits:
 *  - 3 requests per hour per IP
 *  - 3 requests per hour per email address
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Per-IP rate limit
  const ipLimit = await checkRateLimit(`resend-verification:${ip}`, {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    fallbackMode: "fail-closed",
  });
  if (!ipLimit.allowed) {
    // Return 200 to avoid leaking info
    return NextResponse.json({ ok: true });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const { email } = parsed.data;

  // Per-email rate limit — prevents email bombing via IP rotation
  const emailLimit = await checkRateLimit(`resend-verification-email:${email.toLowerCase()}`, {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    fallbackMode: "fail-open",
  });
  if (!emailLimit.allowed) {
    return NextResponse.json({ ok: true });
  }

  const user = await db.user.findFirst({ where: { email: email.toLowerCase() } });

  // Only send if user exists and is not yet verified
  if (user && !user.emailVerified) {
    try {
      const token = jwt.sign(
        { sub: user.id, purpose: "email-verify" },
        getJwtSecret(),
        { expiresIn: "24h" },
      );
      const appUrl = process.env.NEXT_PUBLIC_URL ?? "https://scantient.com";
      const verifyLink = `${appUrl}/verify-email?token=${token}`;
      await sendVerificationEmail(email, verifyLink);
    } catch (err) {
      console.warn("[auth] Failed to send resend verification email:", err);
    }
  }

  // Always 200 — no enumeration
  return NextResponse.json({ ok: true });
}
