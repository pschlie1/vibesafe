import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

/**
 * Timing-safe string comparison using crypto.timingSafeEqual.
 * Prevents timing attacks that could leak the CRON_SECRET length or value.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a.padEnd(512));
  const bufB = Buffer.from(b.padEnd(512));
  return timingSafeEqual(bufA, bufB) && a.length === b.length;
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
