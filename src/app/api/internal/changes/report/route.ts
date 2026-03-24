import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { getChangeAuditReport, parseRange } from "@/lib/wave3-reporting";
import { errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireRole(["ADMIN", "OWNER"]);
  } catch {
    return errorResponse("FORBIDDEN", "Forbidden", undefined, 403);
  }

  const limits = await getOrgLimits(session.orgId);
  if (!["PRO", "ENTERPRISE", "ENTERPRISE_PLUS"].includes(limits.tier)) {
    return errorResponse("FORBIDDEN", "Change audit reports require a Pro plan or higher.", undefined, 403);
  }

  const range = parseRange({
    from: req.nextUrl.searchParams.get("from"),
    to: req.nextUrl.searchParams.get("to"),
    defaultDays: 30,
  });

  const payload = await getChangeAuditReport(session.orgId, range);
  return NextResponse.json(payload);
}
