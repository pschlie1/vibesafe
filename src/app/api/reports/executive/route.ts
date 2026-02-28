import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = await getOrgLimits(session.orgId);
  const allowedTiers = ["PRO", "ENTERPRISE", "ENTERPRISE_PLUS"];
  if (!allowedTiers.includes(limits.tier)) {
    return NextResponse.json(
      { error: "Executive reports require PRO or ENTERPRISE plan", tier: limits.tier },
      { status: 403 },
    );
  }

  const now = new Date();
  const periodFrom = subDays(now, 30);

  // Load org
  const org = await db.organization.findUnique({
    where: { id: session.orgId },
    select: { name: true },
  });

  // Load all apps with all their runs and findings
  const apps = await db.monitoredApp.findMany({
    where: { orgId: session.orgId },
    include: {
      monitorRuns: {
        include: {
          findings: true,
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  // --- Summary ---
  const totalApps = apps.length;
  const healthyApps = apps.filter((a) => a.status === "HEALTHY").length;
  const appsAtRisk = apps.filter((a) =>
    a.status === "WARNING" || a.status === "CRITICAL",
  ).length;

  // All currently open findings across all apps
  const allOpenFindings = apps.flatMap((a) =>
    a.monitorRuns.flatMap((r) => r.findings.filter((f) => f.status === "OPEN")),
  );
  const openCountNow = allOpenFindings.length;

  // Risk score: inverse of health ratio, weighted by severity
  // CRITICAL app = 100 pts, WARNING = 60 pts, HEALTHY = 10 pts, UNKNOWN = 50 pts
  const scoreWeights: Record<string, number> = {
    HEALTHY: 10,
    WARNING: 60,
    CRITICAL: 100,
    UNKNOWN: 50,
  };
  const overallRiskScore =
    totalApps > 0
      ? Math.round(
          apps.reduce((sum, a) => sum + (scoreWeights[a.status] ?? 50), 0) / totalApps,
        )
      : 0;

  // Risk trend: compare open finding count now vs 30 days ago
  // "30 days ago" = findings that existed (created before periodFrom) and weren't yet resolved by then
  const findingsThen = apps.flatMap((a) =>
    a.monitorRuns.flatMap((r) =>
      r.findings.filter(
        (f) =>
          f.createdAt < periodFrom &&
          (f.status !== "RESOLVED" || (f.resolvedAt !== null && f.resolvedAt > periodFrom)),
      ),
    ),
  );
  const openCountThen = findingsThen.length;

  let riskTrend: "improving" | "stable" | "degrading" = "stable";
  if (openCountThen > 0) {
    const delta = (openCountNow - openCountThen) / openCountThen;
    if (delta < -0.1) riskTrend = "improving";
    else if (delta > 0.1) riskTrend = "degrading";
  } else if (openCountNow > 0) {
    riskTrend = "degrading";
  }

  // --- Top risks: top 5 CRITICAL/HIGH open findings across all apps ---
  const criticalHighFindings = apps
    .flatMap((a) =>
      a.monitorRuns.flatMap((r) =>
        r.findings
          .filter(
            (f) =>
              f.status === "OPEN" &&
              (f.severity === "CRITICAL" || f.severity === "HIGH"),
          )
          .map((f) => ({
            appName: a.name,
            appUrl: a.url,
            severity: f.severity,
            title: f.title,
            openSince: f.createdAt.toISOString(),
          })),
      ),
    )
    .sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1 };
      return (
        (severityOrder[a.severity as keyof typeof severityOrder] ?? 9) -
        (severityOrder[b.severity as keyof typeof severityOrder] ?? 9)
      );
    })
    .slice(0, 5);

  // --- Metrics ---
  const totalFindingsOpen = openCountNow;

  const resolvedThisPeriod = apps.flatMap((a) =>
    a.monitorRuns.flatMap((r) =>
      r.findings.filter(
        (f) =>
          f.status === "RESOLVED" &&
          f.resolvedAt !== null &&
          f.resolvedAt >= periodFrom,
      ),
    ),
  );
  const totalFindingsResolvedThisPeriod = resolvedThisPeriod.length;

  // Average days to resolve
  const resolutionDays = resolvedThisPeriod
    .filter((f) => f.resolvedAt !== null)
    .map((f) => {
      const diff = f.resolvedAt!.getTime() - f.createdAt.getTime();
      return diff / (1000 * 60 * 60 * 24);
    });
  const avgResolutionDays =
    resolutionDays.length > 0
      ? Math.round(
          resolutionDays.reduce((s, d) => s + d, 0) / resolutionDays.length,
        )
      : 0;

  // Avg uptime
  const uptimeValues = apps
    .map((a) => a.uptimePercent)
    .filter((u): u is number => u !== null);
  const uptimePercent =
    uptimeValues.length > 0
      ? Math.round((uptimeValues.reduce((s, u) => s + u, 0) / uptimeValues.length) * 10) / 10
      : 100;

  // --- App inventory ---
  const appInventory = apps.map((a) => {
    const openFindings = a.monitorRuns
      .flatMap((r) => r.findings)
      .filter((f) => f.status === "OPEN").length;

    return {
      name: a.name,
      url: a.url,
      status: a.status,
      uptimePercent: a.uptimePercent,
      openFindings,
      lastScanned: a.lastCheckedAt?.toISOString() ?? null,
    };
  });

  return NextResponse.json({
    org: {
      name: org?.name ?? "Unknown Org",
      tier: limits.tier,
    },
    reportDate: now.toISOString(),
    period: {
      from: periodFrom.toISOString(),
      to: now.toISOString(),
    },
    summary: {
      totalApps,
      healthyApps,
      appsAtRisk,
      overallRiskScore,
      riskTrend,
    },
    topRisks: criticalHighFindings,
    metrics: {
      totalFindingsOpen,
      totalFindingsResolvedThisPeriod,
      avgResolutionDays,
      uptimePercent,
    },
    appInventory,
  });
}
