import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/tenant";
import { errorResponse } from "@/lib/api-response";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  // audit-24: Only OWNER/ADMIN may delete API keys (creation already has this guard)
  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Admin access required to revoke API keys", undefined, 403);
  }

  const { id } = await params;
  const key = await db.apiKey.findFirst({ where: { id, orgId: session.orgId } });
  if (!key) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  await db.apiKey.delete({ where: { id } });
  await logAudit(session, "api_key.revoked", id, `Revoked API key: ${key.name}`);

  return NextResponse.json({ ok: true });
}
