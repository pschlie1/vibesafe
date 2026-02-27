import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/enums";

const JWT_SECRET = process.env.JWT_SECRET ?? "vibesafe-dev-secret-change-in-production";
const SESSION_COOKIE = "vibesafe-session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

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

function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_DURATION });
}

function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
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

  const token = signToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

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
  return verifyToken(token);
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
  cookieStore.delete(SESSION_COOKIE);
}
