import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto-util";
import { sendTeamsNotification } from "@/lib/teams-notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await requireRole(["ADMIN", "OWNER"]);
    const rl = await checkRateLimit(`teams-test:${session.orgId}`, { maxAttempts: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
    }

    const integration = await db.integrationConfig.findUnique({
      where: { orgId_type: { orgId: session.orgId, type: "teams" } },
    });

    if (!integration || !integration.enabled) {
      return NextResponse.json(
        { error: "No Teams integration configured." },
        { status: 404 },
      );
    }

    const cfg = integration.config as Record<string, string>;
    const webhookUrl = decrypt(cfg.webhookUrl);

    const success = await sendTeamsNotification(webhookUrl, {
      title: "✅ Scantient Test Notification",
      text: "Your Microsoft Teams integration is working. Security alerts will appear here.",
      severity: "info",
      dashboardUrl: "https://scantient.com/dashboard",
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to deliver test notification to Teams. Check your webhook URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    return errorResponse(msg === "Forbidden" ? "FORBIDDEN" : "UNAUTHORIZED", msg, undefined, msg === "Forbidden" ? 403 : 401);
  }
}
