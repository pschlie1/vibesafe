import { subDays } from "date-fns";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sevenDaysAgo = subDays(new Date(), 7);

  const [apps, criticalFindings, recentRuns] = await Promise.all([
    db.monitoredApp.count(),
    db.finding.count({
      where: { severity: { in: ["CRITICAL", "HIGH"] }, createdAt: { gte: sevenDaysAgo } },
    }),
    db.monitorRun.findMany({
      where: { startedAt: { gte: sevenDaysAgo } },
      include: { app: true, findings: true },
      orderBy: { startedAt: "desc" },
      take: 30,
    }),
  ]);

  const healthyApps = await db.monitoredApp.count({ where: { status: "HEALTHY" } });

  return NextResponse.json({
    summary: {
      totalApps: apps,
      healthyApps,
      riskApps: apps - healthyApps,
      criticalFindings,
    },
    recentRuns,
  });
}
