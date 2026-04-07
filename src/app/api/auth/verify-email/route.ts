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

interface VerifyTokenPayload {
  sub: string;
  purpose: string;
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`verify-email:${ip}`, { maxAttempts: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return errorResponse("BAD_REQUEST", "Missing token", undefined, 400);
  }

  let payload: VerifyTokenPayload;
  try {
    payload = jwt.verify(token, getJwtSecret()) as VerifyTokenPayload;
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid or expired token", undefined, 400);
  }

  if (payload.purpose !== "email-verify") {
    return errorResponse("BAD_REQUEST", "Invalid token purpose", undefined, 400);
  }

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", undefined, 404);
  }

  const wasAlreadyVerified = user.emailVerified;

  if (!user.emailVerified) {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_URL ?? "https://scantient.com";
  // First-time verification → redirect to dashboard with onboarding wizard
  const redirectUrl = wasAlreadyVerified
    ? `${appUrl}/dashboard`
    : `${appUrl}/dashboard?onboarding=true`;

  return NextResponse.json({ ok: true, redirectUrl });
}
