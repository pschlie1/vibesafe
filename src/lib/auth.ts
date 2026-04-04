import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  // Allow Next.js build to import route modules without runtime secrets.
  const value = (!secret && isBuildPhase) ? "build-phase-placeholder-secret" : secret;
  if (!value) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(value);
}

const SESSION_COOKIE = "scantient-session";
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds
/** Exported for tests only — frequency at which sessions are re-validated against the DB. */
export const REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

function getSessionCookieOptions(isProductionOverride?: boolean) {
  const isProduction = isProductionOverride ?? (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production");
  // Share session across apex + subdomains (e.g. scantient.com and www.scantient.com)
  const domain = isProduction ? ".scantient.com" : undefined;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  orgId: string;
  orgName: string;
  orgSlug: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function signToken(payload: SessionUser): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("scantient")
    .setAudience("scantient-app")
    .setExpirationTime(`${SESSION_DURATION}s`)
    .setIssuedAt()
    .sign(getJwtSecret());
}

async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: "scantient",
      audience: "scantient-app",
    });
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<SessionUser> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { org: true },
  });

  if (!user) throw new Error("User not found");

  const session: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    orgId: user.orgId,
    orgName: user.org.name,
    orgSlug: user.org.slug,
  };

  const token = await signToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions());

  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return session;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;

  // Decode to get iat (issued-at) for session invalidation and refresh checks.
  const decoded = decodeJwt(token);
  const tokenIat = decoded.iat ?? 0;
  const tokenIssuedAt = new Date(tokenIat * 1000);
  const age = Math.floor(Date.now() / 1000) - tokenIat;

  if (age > REFRESH_THRESHOLD) {
    // Re-fetch user from DB and issue new token
    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { org: true },
    });
    if (!user) return null;

    // Session invalidation: if the user record was updated (e.g., password changed
    // via reset) after this token was issued, the session is no longer valid.
    // This prevents attackers from retaining access after a password reset, and
    // ensures the legitimate user's old tokens are invalidated immediately on the
    // next DB-validated request (within REFRESH_THRESHOLD of the password change).
    if (user.updatedAt > tokenIssuedAt) {
      return null;
    }

    const refreshed: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      orgId: user.orgId,
      orgName: user.org.name,
      orgSlug: user.org.slug,
    };
    const newToken = await signToken(refreshed);
    const isSecureRefresh = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
    cookieStore.set(SESSION_COOKIE, newToken, getSessionCookieOptions(isSecureRefresh));
    return refreshed;
  }

  return session;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) throw new Error("Forbidden");
  return session;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const opts = getSessionCookieOptions();
  cookieStore.set(SESSION_COOKIE, "", {
    ...opts,
    maxAge: 0,
  });
}
