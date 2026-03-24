/**
 * GET /api/compliance/evidence
 *
 * Returns a structured compliance evidence package for SOC 2, OWASP Top 10, and NIST CSF.
 * Gated to ENTERPRISE and ENTERPRISE_PLUS tiers.
 *
 * Response shape:
 * {
 *   generatedAt: string (ISO)
 *   orgId: string
 *   orgName: string
 *   scanPeriod: { from: string; to: string }
 *   soc2: { score: number; controls: SOC2ControlResult[] }
 *   owasp: { score: number; categories: OWASPCategoryResult[] }
 *   nist: { score: number; functions: NISTFunctionResult[] }
 *   openFindings: FindingItem[]
 *   scanHistory: ScanHistoryItem[]
 * }
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { db } from "@/lib/db";
import {
  getSOC2Controls,
  getOWASPMapping,
  getNISTMapping,
  frameworkPassRate,
} from "@/lib/compliance-frameworks";

export const dynamic = "force-dynamic";

const ALLOWED_TIERS = ["ENTERPRISE", "ENTERPRISE_PLUS"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = await getOrgLimits(session.orgId);
  if (!ALLOWED_TIERS.includes(limits.tier)) {
    return NextResponse.json(
      {
        error:
          "Compliance evidence packages are available on Enterprise plans. Upgrade to export audit-ready evidence for SOC 2, OWASP, and NIST CSF.",
        tier: limits.tier,
        requiredTier: "ENTERPRISE",
      },
      { status: 403 },
    );
  }

  const org = await db.organization.findUnique({
    where: { id: session.orgId },
    select: { id: true, name: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Load open findings (all apps in this org)
  const openFindings = await db.finding.findMany({
    where: {
      status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
      run: { app: { orgId: session.orgId } },
    },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      severity: true,
      status: true,
      createdAt: true,
      app: { select: { id: true, name: true, url: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "asc" }],
    take: 2000,
  });

  // Scan history: last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const scanHistory = await db.monitorRun.findMany({
    where: {
      app: { orgId: session.orgId },
      startedAt: { gte: thirtyDaysAgo },
    },
    select: {
      id: true,
      startedAt: true,
      completedAt: true,
      status: true,
      checksRun: true,
      app: { select: { id: true, name: true } },
      findings: {
        where: { status: { notIn: ["RESOLVED", "IGNORED"] } },
        select: { severity: true },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 200,
  });

  // Map findings to simple shape for framework functions
  const findingInputs = openFindings.map((f) => ({
    code: f.code,
    title: f.title,
    severity: f.severity,
  }));

  // Generate framework results
  const soc2Controls = getSOC2Controls(findingInputs);
  const owaspCategories = getOWASPMapping(findingInputs);
  const nistFunctions = getNISTMapping(findingInputs);

  const soc2Score = frameworkPassRate(soc2Controls);
  const owaspScore = frameworkPassRate(owaspCategories);
  const nistScore = frameworkPassRate(nistFunctions);

  const generatedAt = new Date().toISOString();
  const scanPeriodFrom = thirtyDaysAgo.toISOString();
  const scanPeriodTo = generatedAt;

  const formattedFindings = openFindings.map((f) => ({
    id: f.id,
    code: f.code,
    title: f.title,
    description: f.description,
    severity: f.severity,
    status: f.status,
    detectedAt: f.createdAt.toISOString(),
    app: f.app
      ? { id: f.app.id, name: f.app.name, url: f.app.url }
      : null,
  }));

  const formattedHistory = scanHistory.map((run) => ({
    id: run.id,
    appId: run.app.id,
    appName: run.app.name,
    startedAt: run.startedAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
    status: run.status,
    checksRun: run.checksRun,
    openFindingsCount: run.findings.length,
    criticalCount: run.findings.filter((f) => f.severity === "CRITICAL").length,
    highCount: run.findings.filter((f) => f.severity === "HIGH").length,
  }));

  return NextResponse.json({
    generatedAt,
    orgId: org.id,
    orgName: org.name,
    scanPeriod: { from: scanPeriodFrom, to: scanPeriodTo },
    soc2: {
      score: soc2Score,
      passedControls: soc2Controls.filter((c) => c.status === "pass").length,
      totalControls: soc2Controls.length,
      controls: soc2Controls,
    },
    owasp: {
      score: owaspScore,
      passedCategories: owaspCategories.filter((c) => c.status === "pass").length,
      totalCategories: owaspCategories.length,
      categories: owaspCategories,
    },
    nist: {
      score: nistScore,
      passedFunctions: nistFunctions.filter((f) => f.status === "pass").length,
      totalFunctions: nistFunctions.length,
      functions: nistFunctions,
    },
    openFindings: formattedFindings,
    totalOpenFindings: formattedFindings.length,
    scanHistory: formattedHistory,
  });
}
