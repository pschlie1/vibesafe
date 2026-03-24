import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validation";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const schema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return secret;
}

interface ResetTokenPayload {
  sub: string;
  purpose: string;
  iat: number;
  exp: number;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = await checkRateLimit(`reset-password:${ip}`, {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000,
    fallbackMode: "fail-closed",
  });
  if (!limit.allowed) {
    return errorResponse("RATE_LIMITED", "Too many attempts. Please try again later.", undefined, 429);
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  const { token, password } = parsed.data;

  let payload: ResetTokenPayload;
  try {
    payload = jwt.verify(token, getJwtSecret()) as ResetTokenPayload;
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid or expired reset token", undefined, 400);
  }

  if (payload.purpose !== "password-reset") {
    return errorResponse("BAD_REQUEST", "Invalid token purpose", undefined, 400);
  }

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", undefined, 404);
  }

  // Check if token has already been used: updatedAt > iat means the user was updated after token issue
  const tokenIssuedAt = new Date(payload.iat * 1000);
  if (user.updatedAt > tokenIssuedAt) {
    return errorResponse("BAD_REQUEST", "Reset token has already been used", undefined, 400);
  }

  const passwordHash = await hashPassword(password);

  // Explicitly set updatedAt so getSession() can detect sessions issued before
  // this password change and invalidate them (see auth.ts → getSession).
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash, updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
