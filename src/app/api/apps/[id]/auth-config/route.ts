import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { encryptAuthHeaders, decryptAuthHeaders, maskAuthHeaders } from "@/lib/auth-headers";
import { getOrgLimits } from "@/lib/tenant";
import { checkRateLimit } from "@/lib/rate-limit";
import { atLeast } from "@/lib/tier-capabilities";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const authHeaderSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

const putBodySchema = z
  .array(authHeaderSchema)
  .max(10, "Maximum 10 auth headers allowed");

/** GET . return masked auth headers for the app (OWNER/ADMIN only, PRO+ tier) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Forbidden", undefined, 403);
  }

  const limits = await getOrgLimits(session.orgId);
  if (!atLeast(limits.tier, "PRO")) {
    return errorResponse("FORBIDDEN", "Authenticated scanning requires a Pro plan or higher.", undefined, 403);
  }

  const { id } = await params;
  const app = await db.monitoredApp.findFirst({ where: { id, orgId: session.orgId } });
  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  if (!app.authHeaders) {
    return NextResponse.json({ headers: [] });
  }

  const headers = decryptAuthHeaders(app.authHeaders);
  return NextResponse.json({ headers: maskAuthHeaders(headers) });
}

/** PUT . save/replace auth headers (OWNER/ADMIN only, PRO+ tier) */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Forbidden", undefined, 403);
  }

  const limits = await getOrgLimits(session.orgId);
  if (!atLeast(limits.tier, "PRO")) {
    return errorResponse("FORBIDDEN", "Authenticated scanning requires a Pro plan or higher.", undefined, 403);
  }

  const rl = await checkRateLimit(`auth-config:${session.orgId}`, {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { id } = await params;
  const app = await db.monitoredApp.findFirst({ where: { id, orgId: session.orgId } });
  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid JSON", undefined, 400);
  }

  const parsed = putBodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", undefined, 400);
  }

  const encrypted = encryptAuthHeaders(parsed.data);
  await db.monitoredApp.update({
    where: { id },
    data: { authHeaders: encrypted },
  });

  return NextResponse.json({ ok: true, count: parsed.data.length });
}

/** DELETE . remove auth headers */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Forbidden", undefined, 403);
  }

  const { id } = await params;
  const app = await db.monitoredApp.findFirst({ where: { id, orgId: session.orgId } });
  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  await db.monitoredApp.update({ where: { id }, data: { authHeaders: null } });

  return NextResponse.json({ ok: true });
}
