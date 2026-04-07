import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrgMetrics } from "@/lib/metrics";
import { errorResponse } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const metrics = await getOrgMetrics(session.orgId);
  return NextResponse.json(metrics);
}
