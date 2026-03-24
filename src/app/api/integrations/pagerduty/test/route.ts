import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto-util";
import { createPagerDutyIncident } from "@/lib/pagerduty-notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await requireRole(["ADMIN", "OWNER"]);
    const rl = await checkRateLimit(`pagerduty-test:${session.orgId}`, { maxAttempts: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
    }

    const integration = await db.integrationConfig.findUnique({
      where: { orgId_type: { orgId: session.orgId, type: "pagerduty" } },
    });

    if (!integration || !integration.enabled) {
      return NextResponse.json(
        { error: "No PagerDuty integration configured." },
        { status: 404 },
      );
    }

    const cfg = integration.config as Record<string, string>;
    const routingKey = decrypt(cfg.routingKey);

    const result = await createPagerDutyIncident(routingKey, {
      summary: "Scantient test incident . verify your PagerDuty integration is working.",
      severity: "info",
      source: "scantient.com",
      component: "Scantient",
      group: "Test",
      customDetails: { type: "test", source: "Scantient dashboard" },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create test incident in PagerDuty. Check your routing key." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, deduplicationKey: result.deduplicationKey });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    return errorResponse(msg === "Forbidden" ? "FORBIDDEN" : "UNAUTHORIZED", msg, undefined, msg === "Forbidden" ? 403 : 401);
  }
}
