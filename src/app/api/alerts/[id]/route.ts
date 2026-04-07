import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const updateAlertSchema = z.object({
  enabled: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (["VIEWER", "MEMBER"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Viewers have read-only access", undefined, 403);
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateAlertSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  const config = await db.alertConfig.findFirst({
    where: { id, orgId: session.orgId },
  });
  if (!config) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  const updated = await db.alertConfig.update({
    where: { id },
    data: { enabled: parsed.data.enabled ?? config.enabled },
  });

  return NextResponse.json({ config: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (["VIEWER", "MEMBER"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Viewers have read-only access", undefined, 403);
  }

  const { id } = await params;
  const config = await db.alertConfig.findFirst({
    where: { id, orgId: session.orgId },
  });
  if (!config) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  await db.alertConfig.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
