import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runDueHttpScans } from "@/lib/scanner-http";
import { logApiError } from "@/lib/observability";
import { db } from "@/lib/db";

/**
 * Timing-safe string comparison using crypto.timingSafeEqual.
 * Prevents timing attacks that could leak the CRON_SECRET length or value.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  // Pad both to the same length to avoid length-based timing leaks
  const bufA = Buffer.from(a.padEnd(512));
  const bufB = Buffer.from(b.padEnd(512));
  return timingSafeEqual(bufA, bufB) && a.length === b.length;
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${cronSecret}`;

  // audit-14: Use timing-safe comparison to prevent timing attacks on the secret
  if (!timingSafeStringEqual(auth, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runDueHttpScans(50);

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

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (error) {
    logApiError(error, {
      route: "/api/cron/run",
      method: "GET",
      statusCode: 500,
      details: { requestedLimit: 50 },
    });

    return NextResponse.json({ error: "Failed to execute scheduled scans" }, { status: 500 });
  }
}
