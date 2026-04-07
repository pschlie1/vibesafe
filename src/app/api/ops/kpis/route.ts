import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { getOrgOpsKpis } from "@/lib/ops-metrics";
import { atLeast } from "@/lib/tier-capabilities";
import { errorResponse } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const limits = await getOrgLimits(session.orgId);
  if (!atLeast(limits.tier, "STARTER")) {
    return errorResponse("FORBIDDEN", "Ops KPIs require a Starter plan or higher.", undefined, 403);
  }

  const kpis = await getOrgOpsKpis(session.orgId);
  return NextResponse.json({ kpis });
}
