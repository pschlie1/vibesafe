import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { getIncidentEvidenceExport, parseRange } from "@/lib/wave3-reporting";

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireRole(["ADMIN", "OWNER"]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limits = await getOrgLimits(session.orgId);
  if (!["ENTERPRISE", "ENTERPRISE_PLUS"].includes(limits.tier)) {
    return NextResponse.json(
      { error: "Incident evidence export requires an Enterprise plan." },
      { status: 403 },
    );
  }

  const range = parseRange({
    from: req.nextUrl.searchParams.get("from"),
    to: req.nextUrl.searchParams.get("to"),
    defaultDays: 30,
  });

  const payload = await getIncidentEvidenceExport(session.orgId, range);
  return NextResponse.json(payload);
}
