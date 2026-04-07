import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto-util";
import { getOrgLimits } from "@/lib/tenant";
import { isPrivateUrl } from "@/lib/ssrf-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";

export async function POST(_req?: Request) {
  try {
    const session = await requireRole(["ADMIN", "OWNER"]);
    const rl = await checkRateLimit(`jira-test:${session.orgId}`, { maxAttempts: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
    }
    const limits = await getOrgLimits(session.orgId);
    if (!["PRO", "ENTERPRISE", "ENTERPRISE_PLUS"].includes(limits.tier)) {
      return errorResponse("FORBIDDEN", "Jira integration requires a Pro plan or higher.", undefined, 403);
    }
    const integration = await db.integrationConfig.findUnique({
      where: { orgId_type: { orgId: session.orgId, type: "jira" } },
    });
    if (!integration) return errorResponse("NOT_FOUND", "Jira not configured", undefined, 404);
    const cfg = integration.config as Record<string, string>;
    if (await isPrivateUrl(cfg.url)) {
      return errorResponse("BAD_REQUEST", "Jira URL must be a public address", undefined, 400);
    }
    const apiToken = decrypt(cfg.apiToken);
    const credentials = Buffer.from(`${cfg.email}:${apiToken}`).toString("base64");
    const baseUrl = cfg.url.replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/rest/api/3/myself`, {
      headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return errorResponse("INTERNAL_ERROR", `Jira responded with ${res.status}: ${text}`, undefined, 502);
    }
    const data = await res.json() as { displayName?: string };
    return NextResponse.json({ ok: true, displayName: data.displayName ?? cfg.email });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    if (msg === "Forbidden") return errorResponse("FORBIDDEN", msg, undefined, 403);
    if (msg === "Unauthorized") return errorResponse("UNAUTHORIZED", msg, undefined, 401);
    return errorResponse("INTERNAL_ERROR", msg, undefined, 500);
  }
}
