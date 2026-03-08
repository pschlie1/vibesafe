import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { SubscriptionTier } from "@prisma/client";
import { db } from "@/lib/db";

// ── Tier partition ───────────────────────────────────────────────────────────
// Single source of truth for which tiers each cron handles.
// If a new SubscriptionTier is added, the exhaustiveness check below will
// throw at startup until the tier is assigned to one of the two arrays.

export const PREMIUM_TIERS: SubscriptionTier[] = [
  SubscriptionTier.ENTERPRISE,
  SubscriptionTier.ENTERPRISE_PLUS,
];

export const NON_PREMIUM_TIERS: SubscriptionTier[] = [
  SubscriptionTier.FREE,
  SubscriptionTier.STARTER,
  SubscriptionTier.PRO,
  SubscriptionTier.EXPIRED,
];

// Exhaustiveness check: every SubscriptionTier must appear in exactly one list.
const allPartitioned = new Set([...PREMIUM_TIERS, ...NON_PREMIUM_TIERS]);
const allEnum = Object.values(SubscriptionTier) as SubscriptionTier[];
for (const tier of allEnum) {
  if (!allPartitioned.has(tier)) {
    throw new Error(
      `SubscriptionTier "${tier}" is not assigned to PREMIUM_TIERS or NON_PREMIUM_TIERS in cron-auth.ts`,
    );
  }
}
if (allPartitioned.size !== allEnum.length) {
  throw new Error(
    "PREMIUM_TIERS and NON_PREMIUM_TIERS contain duplicates or overlap — each tier must appear exactly once",
  );
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Timing-safe string comparison using HMAC-style digest.
 * Hashing normalizes both inputs to 32-byte buffers, avoiding the length
 * mismatch throw from crypto.timingSafeEqual.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function validateCronAuth(req: Request): { authorized: boolean; errorResponse?: NextResponse } {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return { authorized: false, errorResponse: NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 }) };
  }

  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${cronSecret}`;

  if (!timingSafeStringEqual(auth, expected)) {
    return { authorized: false, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { authorized: true };
}

export async function logCronHeartbeat(
  results: Array<{ orgId: string; appId: string; status: string; findingsCount?: number; error?: string }>,
): Promise<void> {
  const byOrg = new Map<string, { processed: number; critical: number; warning: number }>();
  for (const r of results) {
    if (!byOrg.has(r.orgId)) byOrg.set(r.orgId, { processed: 0, critical: 0, warning: 0 });
    const bucket = byOrg.get(r.orgId)!;
    bucket.processed += 1;
    if (r.status === "CRITICAL") bucket.critical += 1;
    if (r.status === "WARNING") bucket.warning += 1;
  }

  if (byOrg.size > 0) {
    await db.auditLog.createMany({
      data: Array.from(byOrg.entries()).map(([orgId, agg]) => ({
        orgId,
        action: "CRON_HEARTBEAT",
        resource: "scan_scheduler",
        details: JSON.stringify({
          processed: agg.processed,
          critical: agg.critical,
          warning: agg.warning,
          timestamp: new Date().toISOString(),
        }),
      })),
    });
  }
}
