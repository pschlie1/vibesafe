import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { atLeast } from "@/lib/tier-capabilities";
import { errorResponse } from "@/lib/api-response";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** POST . generate a new agent key for the app (ADMIN/OWNER only, PRO+ tier) */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Forbidden", undefined, 403);
  }

  const limits = await getOrgLimits(session.orgId);
  if (!atLeast(limits.tier, "PRO")) {
    return errorResponse("FORBIDDEN", "Scan agent keys require a Pro plan or higher.", undefined, 403);
  }

  const { id } = await params;
  const app = await db.monitoredApp.findFirst({ where: { id, orgId: session.orgId } });
  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  const rawKey = `sa_${randomBytes(32).toString("base64url")}`;
  const keyHash = sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 10);

  await db.monitoredApp.update({
    where: { id },
    data: {
      agentEnabled: true,
      agentKeyHash: keyHash,
      agentKeyPrefix: keyPrefix,
    },
  });

  return NextResponse.json({ plainKey: rawKey, prefix: keyPrefix });
}

/** DELETE . revoke the agent key for the app (ADMIN/OWNER only) */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (!["OWNER", "ADMIN"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Forbidden", undefined, 403);
  }

  const { id } = await params;
  const app = await db.monitoredApp.findFirst({ where: { id, orgId: session.orgId } });
  if (!app) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  await db.monitoredApp.update({
    where: { id },
    data: {
      agentEnabled: false,
      agentKeyHash: null,
      agentKeyPrefix: null,
    },
  });

  return NextResponse.json({ ok: true });
}
