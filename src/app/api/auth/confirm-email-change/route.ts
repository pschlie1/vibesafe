import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return secret;
}

interface EmailChangePayload {
  sub: string;
  purpose: string;
  newEmail: string;
  iat: number;
  exp: number;
}

/**
 * GET /api/auth/confirm-email-change?token=...
 *
 * Confirms an email address change by verifying the signed JWT sent to the new
 * email address. On success, updates the user's email in the DB and bumps
 * updatedAt so all existing sessions are invalidated on next refresh.
 *
 * Public route — no session required (user may be on a different device).
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`email-change-confirm:${ip}`, { maxAttempts: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return errorResponse("BAD_REQUEST", "Missing token", undefined, 400);
  }

  let payload: EmailChangePayload;
  try {
    payload = jwt.verify(token, getJwtSecret()) as EmailChangePayload;
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid or expired token", undefined, 400);
  }

  if (payload.purpose !== "email-change" || !payload.newEmail) {
    return errorResponse("BAD_REQUEST", "Invalid token purpose", undefined, 400);
  }

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", undefined, 404);
  }

  // Token one-time use: if user was updated after token was issued, it's already been used
  const tokenIssuedAt = new Date(payload.iat * 1000);
  if (user.updatedAt > tokenIssuedAt) {
    return errorResponse("BAD_REQUEST", "This email change link has already been used", undefined, 400);
  }

  // Check no one else claimed this email in the meantime
  const conflict = await db.user.findFirst({ where: { email: payload.newEmail } });
  if (conflict && conflict.id !== user.id) {
    return errorResponse("CONFLICT", "This email address is already in use", undefined, 409);
  }

  // Apply the change — bump updatedAt to invalidate all existing sessions
  await db.user.update({
    where: { id: user.id },
    data: { email: payload.newEmail, updatedAt: new Date() },
  });

  const appUrl = process.env.NEXT_PUBLIC_URL ?? "https://scantient.com";
  return NextResponse.redirect(new URL("/settings/account?email_changed=true", appUrl));
}
