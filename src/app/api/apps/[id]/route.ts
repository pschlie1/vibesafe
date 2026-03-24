import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/tenant";
import { isPrivateUrl } from "@/lib/ssrf-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { encrypt } from "@/lib/crypto-util";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const updateAppSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  repoUrl: z.string().url().optional().nullable(),
  monitorEnabled: z.boolean().optional(),
  probeUrl: z.string().url().optional().nullable(),
  probeToken: z.string().optional().nullable(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const { id } = await params;
  const app = await db.monitoredApp.findFirst({
    where: { id, orgId: session.orgId },
    include: {
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        include: { findings: { orderBy: { severity: "asc" } } },
        take: 20,
      },
    },
  });

  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);
  return NextResponse.json({ app });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (["VIEWER", "MEMBER"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Viewers have read-only access", undefined, 403);
  }

  const rl = await checkRateLimit(`app-update:${session.orgId}`, {
    maxAttempts: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateAppSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  // SSRF guard: reject private/internal URLs at save time
  if (parsed.data.url && await isPrivateUrl(parsed.data.url)) {
    return NextResponse.json(
      { error: "App URL must be a public address. Private and internal URLs are not allowed." },
      { status: 400 },
    );
  }

  const app = await db.monitoredApp.findFirst({
    where: { id, orgId: session.orgId },
  });
  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  const { probeToken, ...restData } = parsed.data;
  const updated = await db.monitoredApp.update({
    where: { id },
    data: {
      ...restData,
      // Encrypt probe token at rest . null clears the token, undefined skips the field
      ...(probeToken !== undefined
        ? { probeToken: probeToken ? encrypt(probeToken) : null }
        : {}),
    },
  });

  await logAudit(session, "app.updated", id, `Updated ${updated.name}`);
  return NextResponse.json({ app: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (["VIEWER", "MEMBER"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Viewers have read-only access", undefined, 403);
  }

  const rl = await checkRateLimit(`app-delete:${session.orgId}`, {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { id } = await params;

  // Verify ownership
  const app = await db.monitoredApp.findFirst({
    where: { id, orgId: session.orgId },
  });

  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  await db.monitoredApp.delete({ where: { id } });
  await logAudit(session, "app.deleted", id, `Removed ${app.name}`);

  return NextResponse.json({ ok: true });
}
