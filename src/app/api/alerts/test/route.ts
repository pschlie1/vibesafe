import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendTestNotification } from "@/lib/alerts";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const testSchema = z.object({
  configId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  // audit-24: Rate-limit test notifications per org.  Without this, any admin
  // could hammer the endpoint to spam webhook destinations.  All other
  // integration test routes (Jira, PagerDuty, Teams) already have this guard.
  const rl = await checkRateLimit(`alerts-test:${session.orgId}`, {
    maxAttempts: 5,
    windowMs: 60_000, // 5 per minute
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const body = await req.json();
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  // Verify the config belongs to the user's org
  const config = await db.alertConfig.findFirst({
    where: { id: parsed.data.configId, orgId: session.orgId },
  });
  if (!config) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  try {
    await sendTestNotification(config.id);
    return NextResponse.json({ ok: true, message: "Test notification sent" });
  } catch (error) {
    // audit-24: Log full error internally but do NOT echo raw exception messages
    // to the client . they may contain internal URLs, IPs, or webhook secrets.
    console.error("[alerts/test] Test notification failed:", error);
    return NextResponse.json(
      { error: "Failed to send test notification. Check your alert configuration." },
      { status: 500 },
    );
  }
}
