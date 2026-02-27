/**
 * Tenant-scoped database helpers.
 * Every data access goes through these to enforce isolation.
 */
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

/** Get subscription limits for the current org */
export async function getOrgLimits(orgId: string) {
  const sub = await db.subscription.findUnique({ where: { orgId } });

  const defaults = {
    FREE: { maxApps: 2, maxUsers: 1 },
    STARTER: { maxApps: 5, maxUsers: 2 },
    PRO: { maxApps: 15, maxUsers: 5 },
    ENTERPRISE: { maxApps: 50, maxUsers: 999 },
  };

  const tier = sub?.tier ?? "FREE";
  return {
    tier,
    status: sub?.status ?? "TRIALING",
    ...defaults[tier],
    trialEndsAt: sub?.trialEndsAt,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
  };
}

/** Check if org can add more apps */
export async function canAddApp(orgId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getOrgLimits(orgId);
  const currentApps = await db.monitoredApp.count({ where: { orgId } });

  if (currentApps >= limits.maxApps) {
    return {
      allowed: false,
      reason: `Your ${limits.tier} plan allows ${limits.maxApps} apps. Upgrade to add more.`,
    };
  }

  return { allowed: true };
}

/** Check if org can add more users */
export async function canAddUser(orgId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getOrgLimits(orgId);
  const currentUsers = await db.user.count({ where: { orgId } });

  if (currentUsers >= limits.maxUsers) {
    return {
      allowed: false,
      reason: `Your ${limits.tier} plan allows ${limits.maxUsers} users. Upgrade to add more.`,
    };
  }

  return { allowed: true };
}

/** Audit log helper */
export async function logAudit(
  session: SessionUser,
  action: string,
  resource: string,
  details?: string,
) {
  await db.auditLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action,
      resource,
      details,
    },
  });
}
