import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/tenant";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const patchSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Admin access required", undefined, 403);
  }

  const rl = await checkRateLimit(`team-remove:${session.orgId}`, {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { id } = await params;

  if (id === session.id) {
    return errorResponse("BAD_REQUEST", "You cannot remove yourself", undefined, 400);
  }

  const target = await db.user.findFirst({ where: { id, orgId: session.orgId } });
  if (!target) return errorResponse("NOT_FOUND", "Member not found", undefined, 404);

  if (target.role === "OWNER") {
    return errorResponse("FORBIDDEN", "Cannot remove the account owner", undefined, 403);
  }

  // Revoke all API keys created by this user for this org before deleting the user.
  // This prevents a removed employee from retaining API access via previously-issued keys.
  // (FK onDelete:SetNull would null the field on user delete but not delete the key itself.)
  await db.apiKey.deleteMany({ where: { createdByUserId: id, orgId: session.orgId } });

  await db.user.delete({ where: { id } });
  await logAudit(session, "user.removed", id, `Removed ${target.email} from org`);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (session.role !== "OWNER") {
    return errorResponse("FORBIDDEN", "Only the account owner is allowed to change roles", undefined, 403);
  }

  const rl = await checkRateLimit(`team-role-change:${session.orgId}`, {
    maxAttempts: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { id } = await params;

  if (id === session.id) {
    return errorResponse("BAD_REQUEST", "You cannot change your own role", undefined, 400);
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  const target = await db.user.findFirst({ where: { id, orgId: session.orgId } });
  if (!target) return errorResponse("NOT_FOUND", "Member not found", undefined, 404);

  if (target.role === "OWNER") {
    return errorResponse("FORBIDDEN", "Cannot change the owner role", undefined, 403);
  }

  const updated = await db.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  });

  await logAudit(
    session,
    "user.role_changed",
    id,
    `Changed ${target.email} role to ${parsed.data.role}`,
  );
  return NextResponse.json({ member: updated });
}
