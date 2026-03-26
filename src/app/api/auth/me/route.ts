import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Not authenticated", undefined, 401);
  }

  const limits = await getOrgLimits(session.orgId);
  const appCount = await db.monitoredApp.count({ where: { orgId: session.orgId } });
  const userCount = await db.user.count({ where: { orgId: session.orgId } });

  // Return currentPeriodEnd when the subscription is set to cancel — billing page needs it for the warning banner.
  let currentPeriodEnd: string | null = null;
  if (limits.cancelAtPeriodEnd) {
    const sub = await db.subscription.findUnique({
      where: { orgId: session.orgId },
      select: { currentPeriodEnd: true },
    });
    currentPeriodEnd = sub?.currentPeriodEnd?.toISOString() ?? null;
  }

  return NextResponse.json({
    user: session,
    org: {
      limits: {
        ...limits,
        currentPeriodEnd,
      },
      appCount,
      userCount,
    },
  });
}
