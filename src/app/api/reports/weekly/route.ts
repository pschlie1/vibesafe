import { subDays } from "date-fns";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = subDays(new Date(), 7);

  const apps = await db.monitoredApp.findMany({
    include: {
      monitorRuns: {
        where: { startedAt: { gte: since } },
        include: { findings: true },
      },
    },
  });

  const report = apps.map((app) => {
    const totalRuns = app.monitorRuns.length;
    const findings = app.monitorRuns.flatMap((r) => r.findings);
    const critical = findings.filter((f) => ["CRITICAL", "HIGH"].includes(f.severity)).length;

    return {
      app: app.name,
      owner: app.ownerEmail,
      status: app.status,
      runs: totalRuns,
      criticalFindings: critical,
      lastCheckedAt: app.lastCheckedAt,
    };
  });

  return NextResponse.json({ generatedAt: new Date(), report });
}
