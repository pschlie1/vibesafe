import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { canAddUser, logAudit } from "@/lib/tenant";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validation";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

// GET /api/auth/invite/[token] . return invite details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`invite-token:${ip}`, { maxAttempts: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: { org: true },
  });

  if (!invite) {
    return errorResponse("NOT_FOUND", "Invite not found", undefined, 404);
  }

  if (invite.expiresAt < new Date()) {
    return errorResponse("NOT_FOUND", "Invite has expired", undefined, 410);
  }

  return NextResponse.json({
    email: invite.email,
    orgName: invite.org.name,
    role: invite.role,
  });
}

const acceptSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: passwordSchema,
});

// POST /api/auth/invite/[token] . accept invite and create account
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`invite-token:${ip}`, { maxAttempts: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: { org: true },
  });

  if (!invite) {
    return errorResponse("NOT_FOUND", "Invite not found", undefined, 404);
  }

  if (invite.expiresAt < new Date()) {
    return errorResponse("NOT_FOUND", "Invite has expired", undefined, 410);
  }

  const body = await req.json();
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  const { name, password } = parsed.data;

  // Check if user already exists with this email
  const existing = await db.user.findFirst({
    where: { email: invite.email },
  });
  if (existing) {
    // The user already has an account. Since each account belongs to exactly one org,
    // we can't auto-join them to this org. Direct them to contact support or the org owner.
    return NextResponse.json(
      {
        error: "An account with this email already exists. Each account belongs to one organization — please contact the organization owner to transfer your account, or use a different email address.",
        code: "ACCOUNT_EXISTS",
      },
      { status: 409 },
    );
  }

  // Check if org can still accept more users at acceptance time (prevents race conditions)
  const userCheck = await canAddUser(invite.orgId);
  if (!userCheck.allowed) {
    return NextResponse.json(
      { error: "Your organization has reached its user limit. Ask the owner to upgrade the plan." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  // Atomically create user and delete invite . if either step fails the other
  // is rolled back. Without this transaction, a failed invite.delete would leave
  // the invite reusable by a second party to create a duplicate account.
  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: invite.email,
        name,
        passwordHash,
        role: invite.role,
        orgId: invite.orgId,
        emailVerified: true, // verified by clicking the invite link
      },
    });

    // Delete the invite (one-time use)
    await tx.invite.delete({ where: { token } });

    return created;
  });

  // Create session
  const session = await createSession(user.id);
  // Audit log: invite accepted (fire-and-forget)
  logAudit(session, "invite.accepted", "auth", `invite:${token}`).catch(() => { /* non-fatal */ });

  return NextResponse.json({ user: session }, { status: 201 });
}
