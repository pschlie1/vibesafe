/**
 * POST /api/public/ci-gate
 *
 * Scantient CI/CD Security Gate.
 * Used by the Scantient GitHub Action to block merges when security findings
 * exceed the configured threshold.
 *
 * Request body:
 * {
 *   apiKey: string
 *   url: string
 *   failOn?: "critical" | "high" | "medium"  (default: "critical")
 * }
 *
 * Response:
 * - 200  { passed: true,  findings: [], score: number, reportUrl: string }
 * - 422  { passed: false, findings: [], score: number, reportUrl: string }
 * - 400  Bad request
 * - 401  Invalid API key
 * - 403  Tier not eligible (PRO+ required)
 * - 429  Rate limit exceeded
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getOrgLimits } from "@/lib/tenant";
import { runHttpScanForApp } from "@/lib/scanner-http";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyCors, corsPreflightResponse, CORS_HEADERS_PUBLIC } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflightResponse(CORS_HEADERS_PUBLIC);
}

const PRO_TIERS = ["PRO", "ENTERPRISE", "ENTERPRISE_PLUS"];

const SEVERITY_ORDER = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
type Severity = keyof typeof SEVERITY_ORDER;

const bodySchema = z.object({
  apiKey: z.string().min(1, "apiKey is required"),
  url: z.string().url("url must be a valid URL"),
  failOn: z.enum(["critical", "high", "medium"]).default("critical"),
});

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

async function handler(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { apiKey, url, failOn } = parsed.data;

  // Authenticate via API key in body (same hashing logic as authenticateApiKeyHeader)
  const API_KEY_PREFIX = "vs_";
  if (!apiKey.startsWith(API_KEY_PREFIX) || apiKey.length < 10 || apiKey.length > 60) {
    return NextResponse.json({ error: "Invalid API key format" }, { status: 401 });
  }
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const keyRecord = await db.apiKey.findFirst({ where: { keyHash } });
  if (!keyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: "API key has expired" }, { status: 401 });
  }
  const orgId = keyRecord.orgId;
  // Update last used
  await db.apiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  // Tier gate: PRO or higher required
  const limits = await getOrgLimits(orgId);
  if (!PRO_TIERS.includes(limits.tier)) {
    return NextResponse.json(
      {
        error: `CI gate requires a PRO or Enterprise plan. Current plan: ${limits.tier}.`,
        upgradeUrl: "https://scantient.com/pricing",
      },
      { status: 403 },
    );
  }

  // Rate limit (shared with ci-scan to prevent bypass)
  const rateCheck = await checkRateLimit(`ci-scan:${orgId}`, {
    maxAttempts: limits.tier === "PRO" ? 50 : 200,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Scan limit reached. Your ${limits.tier} plan allows ${limits.tier === "PRO" ? 50 : 200} CI scans per day.`,
        retryAfter: rateCheck.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 3600) },
      },
    );
  }

  // Find or create the monitored app
  let app = await db.monitoredApp.findFirst({ where: { url, orgId } });
  if (!app) {
    const appCount = await db.monitoredApp.count({ where: { orgId } });
    if (appCount >= limits.maxApps) {
      return NextResponse.json(
        {
          error: `App limit reached for your ${limits.tier} plan (${limits.maxApps} apps). Upgrade or remove an existing app.`,
          upgradeUrl: "https://scantient.com/pricing",
        },
        { status: 403 },
      );
    }
    app = await db.monitoredApp.create({
      data: {
        orgId,
        name: new URL(url).hostname,
        url,
        ownerEmail: "ci@scantient",
        criticality: "medium",
      },
    });
  }

  // Run the scan (waits synchronously, up to ~60s)
  let runResult: { runId: string; appId: string; status: string; findingsCount: number };
  try {
    runResult = await runHttpScanForApp(app.id, { source: "api" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 500 },
    );
  }

  // Load findings from the completed run
  const findings = await db.finding.findMany({
    where: { runId: runResult.runId },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      severity: true,
      fixPrompt: true,
      status: true,
    },
    orderBy: [{ severity: "asc" }],
  });

  const score = calcScore(findings);
  const failSeverityRank = SEVERITY_ORDER[failOn.toUpperCase() as Severity];

  // Passed = no findings at or above the fail threshold
  const passed = !findings.some(
    (f) => SEVERITY_ORDER[f.severity as Severity] >= failSeverityRank,
  );

  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = findings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = findings.filter((f) => f.severity === "MEDIUM").length;

  const reportUrl = `https://scantient.com/apps/${app.id}`;

  const formattedFindings = findings.map((f) => ({
    id: f.id,
    code: f.code,
    title: f.title,
    description: f.description,
    severity: f.severity,
    fixPrompt: f.fixPrompt,
  }));

  return NextResponse.json(
    {
      passed,
      score,
      criticalCount,
      highCount,
      mediumCount,
      totalFindings: findings.length,
      findings: formattedFindings,
      reportUrl,
      appId: app.id,
    },
    { status: passed ? 200 : 422 },
  );
}

export async function POST(req: Request) {
  return applyCors(await handler(req), CORS_HEADERS_PUBLIC);
}
