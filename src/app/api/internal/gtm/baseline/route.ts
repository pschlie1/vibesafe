import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { getGtmBaseline, parseRange } from "@/lib/wave3-reporting";

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requireRole(["ADMIN", "OWNER"]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limits = await getOrgLimits(session.orgId);
  if (!["PRO", "ENTERPRISE", "ENTERPRISE_PLUS"].includes(limits.tier)) {
    return NextResponse.json({ error: "GTM baseline reports require a Pro plan or higher." }, { status: 403 });
  }

  const range = parseRange({
    from: req.nextUrl.searchParams.get("from"),
    to: req.nextUrl.searchParams.get("to"),
    defaultDays: 30,
  });

  const payload = await getGtmBaseline(session.orgId, range);
  return NextResponse.json(payload);
}
