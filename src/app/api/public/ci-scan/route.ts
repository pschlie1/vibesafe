import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticateApiKeyHeader } from "@/lib/api-auth";
import { runHttpScanForApp } from "@/lib/scanner-http";
import { getOrgLimits } from "@/lib/tenant";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { applyCors, corsPreflightResponse, CORS_HEADERS_PUBLIC } from "@/lib/cors";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

export function OPTIONS() {
  return corsPreflightResponse(CORS_HEADERS_PUBLIC);
}

const CI_SCAN_RATE_LIMITS: Record<string, number> = {
  FREE: 3,
  STARTER: 10,
  PRO: 50,
  ENTERPRISE: 200,
  ENTERPRISE_PLUS: 200,
};

const bodySchema = z.object({
  url: z.string().url(),
  failOn: z.enum(["critical", "high", "medium"]).optional().default("critical"),
});

const SEVERITY_ORDER = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
type Severity = keyof typeof SEVERITY_ORDER;

function calcScore(findings: Array<{ severity: string }>): number {
  let score = 100;
  for (const f of findings) {
    const sev = f.severity as Severity;
    if (sev === "CRITICAL") score -= 25;
    else if (sev === "HIGH") score -= 10;
    else if (sev === "MEDIUM") score -= 5;
    else score -= 1;
  }
  return Math.max(0, score);
}

function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

async function handler(req: Request): Promise<NextResponse> {
  // IP-based rate limit: 20 requests per hour per IP (defense-in-depth, matches /api/public/score pattern)
  const ip = getClientIp(req);
  const ipRateCheck = await checkRateLimit(`ci-scan-ip:${ip}`, {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  });
  if (!ipRateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later.", retryAfterSeconds: ipRateCheck.retryAfterSeconds },
      {
        status: 429,
        headers: ipRateCheck.retryAfterSeconds
          ? { "Retry-After": String(ipRateCheck.retryAfterSeconds) }
          : {},
      },
    );
  }

  const orgId = await authenticateApiKeyHeader(req);
  if (!orgId) return errorResponse("UNAUTHORIZED", "Invalid API key", undefined, 401);

  // Tier-based rate limit . shared bucket with manual-scan to prevent bypass
  const orgLimits = await getOrgLimits(orgId);
  const maxScans = CI_SCAN_RATE_LIMITS[orgLimits.tier] ?? CI_SCAN_RATE_LIMITS.FREE;
  const rateCheck = await checkRateLimit(`manual-scan:${orgId}`, {
    maxAttempts: maxScans,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `CI scan limit reached. Your ${orgLimits.tier} plan allows ${maxScans} scans per day.` },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 3600) } },
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch { return errorResponse("BAD_REQUEST", "Invalid JSON body", undefined, 400); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);

  const { url, failOn } = parsed.data;
  let app = await db.monitoredApp.findFirst({ where: { url, orgId } });
  if (!app) {
    const existingCount = await db.monitoredApp.count({ where: { orgId } });
    if (existingCount >= orgLimits.maxApps) {
      return errorResponse("FORBIDDEN", "App limit reached for your plan. Upgrade to add more apps.", undefined, 403);
    }
    app = await db.monitoredApp.create({ data: { orgId, name: new URL(url).hostname, url, ownerEmail: "ci@scantient", criticality: "medium" } });
  }

  let runResult: { runId: string; appId: string; status: string; findingsCount: number; responseTimeMs?: number };
  try {
    runResult = await runHttpScanForApp(app.id, { source: "api" });
  } catch (err) {
    return errorResponse("INTERNAL_ERROR", err instanceof Error ? err.message : "Scan failed", undefined, 500);
  }

  const findings = await db.finding.findMany({
    where: { runId: runResult.runId },
    select: { id: true, code: true, title: true, description: true, severity: true, fixPrompt: true, status: true },
    orderBy: { severity: "asc" },
  });

  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = findings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = findings.filter((f) => f.severity === "MEDIUM").length;
  const score = calcScore(findings);
  const grade = scoreToGrade(score);
  const failSeverityOrder = SEVERITY_ORDER[failOn.toUpperCase() as Severity];
  const passed = !findings.some((f) => SEVERITY_ORDER[f.severity as Severity] >= failSeverityOrder);

  const parts: string[] = [];
  if (criticalCount > 0) parts.push(`${criticalCount} CRITICAL`);
  if (highCount > 0) parts.push(`${highCount} HIGH`);
  if (mediumCount > 0) parts.push(`${mediumCount} MEDIUM`);
  const summary = parts.length > 0 ? `${parts.join(", ")} finding${findings.length !== 1 ? "s" : ""} detected` : "No significant findings";

  return NextResponse.json({ passed, score, grade, findingsCount: findings.length, criticalCount, highCount, mediumCount, summary, findings, dashboardUrl: `https://scantient.com/apps/${app.id}` }, { status: passed ? 200 : 422 });
}

export async function POST(req: Request) {
  return applyCors(await handler(req), CORS_HEADERS_PUBLIC);
}
