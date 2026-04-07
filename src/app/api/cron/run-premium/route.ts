import { NextResponse } from "next/server";
import { runDueHttpScans } from "@/lib/scanner-http";
import { logApiError } from "@/lib/observability";
import { validateCronAuth, logCronHeartbeat, PREMIUM_TIERS } from "@/lib/cron-auth";
import { errorResponse } from "@/lib/api-response";

export async function GET(req: Request) {
  const authResult = validateCronAuth(req);
  if (!authResult.authorized) {
    return authResult.errorResponse!;
  }

  try {
    const results = await runDueHttpScans(50, { tiers: PREMIUM_TIERS });

    await logCronHeartbeat(results);

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (error) {
    logApiError(error, {
      route: "/api/cron/run-premium",
      method: "GET",
      statusCode: 500,
      details: { requestedLimit: 50 },
    });

    return errorResponse("INTERNAL_ERROR", "Failed to execute scheduled scans", undefined, 500);
  }
}
