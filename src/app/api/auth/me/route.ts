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

  // Fetch subscription once for both currentPeriodEnd and hasSubscription.
  const sub = await db.subscription.findUnique({
    where: { orgId: session.orgId },
    select: { currentPeriodEnd: true, stripeSubscriptionId: true },
  });

  // Return currentPeriodEnd when the subscription is set to cancel — billing page needs it for the warning banner.
  const currentPeriodEnd =
    limits.cancelAtPeriodEnd && sub?.currentPeriodEnd
      ? sub.currentPeriodEnd.toISOString()
      : null;

  // True when the org has an active Stripe subscription (false for LTD / one-time purchases).
  const hasSubscription = !!sub?.stripeSubscriptionId;

  return NextResponse.json({
    user: session,
    org: {
      limits: {
        ...limits,
        currentPeriodEnd,
        hasSubscription,
      },
      appCount,
      userCount,
    },
  });
}
