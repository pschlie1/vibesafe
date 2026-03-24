export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function computeComplianceScore(findings: { severity: string }[]): number {
  const penalty = findings.reduce((sum, f) => {
    if (f.severity === "CRITICAL") return sum + 25;
    if (f.severity === "HIGH") return sum + 10;
    if (f.severity === "MEDIUM") return sum + 3;
    return sum + 1;
  }, 0);
  return Math.max(0, 100 - penalty);
}

function ragColor(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-error";
}

function ragBadge(score: number): string {
  if (score >= 70) return "bg-success/10 text-success";
  if (score >= 40) return "bg-warning/10 text-warning";
  return "bg-error/10 text-error";
}

function ragLabel(score: number): string {
  if (score >= 70) return "Healthy";
  if (score >= 40) return "At Risk";
  return "Critical";
}

export default async function MspDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all client orgs
  const clientOrgs = await db.organization.findMany({
    where: { parentOrgId: session.orgId },
    orderBy: { name: "asc" },
    include: {
      apps: {
        select: {
          id: true,
          monitorRuns: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: {
              startedAt: true,
              findings: {
                where: { status: { notIn: ["RESOLVED", "IGNORED"] } },
                select: { severity: true },
              },
            },
          },
        },
      },
    },
  });

  interface ClientRow {
    orgId: string;
    orgName: string;
    orgSlug: string;
    totalApps: number;
    criticalFindings: number;
    highFindings: number;
    totalOpenFindings: number;
    lastScanAt: Date | null;
    complianceScore: number;
    grade: string;
  }

  const clients: ClientRow[] = clientOrgs.map((org) => {
    const allOpenFindings: { severity: string }[] = [];
    let lastScanAt: Date | null = null;

    for (const app of org.apps) {
      const latestRun = app.monitorRuns[0];
      if (latestRun) {
        allOpenFindings.push(...latestRun.findings);
        if (!lastScanAt || latestRun.startedAt > lastScanAt) {
          lastScanAt = latestRun.startedAt;
        }
      }
    }

    const score = computeComplianceScore(allOpenFindings);
    return {
      orgId: org.id,
      orgName: org.name,
      orgSlug: org.slug,
      totalApps: org.apps.length,
      criticalFindings: allOpenFindings.filter((f) => f.severity === "CRITICAL").length,
      highFindings: allOpenFindings.filter((f) => f.severity === "HIGH").length,
      totalOpenFindings: allOpenFindings.length,
      lastScanAt,
      complianceScore: score,
      grade: scoreToGrade(score),
    };
  });

  // Sort worst first
  clients.sort((a, b) => {
    if (b.criticalFindings !== a.criticalFindings) return b.criticalFindings - a.criticalFindings;
    return b.highFindings - a.highFindings;
  });

  // Portfolio aggregates
  const totalApps = clients.reduce((s, c) => s + c.totalApps, 0);
  const totalCritical = clients.reduce((s, c) => s + c.criticalFindings, 0);
  const totalOpenFindings = clients.reduce((s, c) => s + c.totalOpenFindings, 0);
  const overallScore =
    clients.length > 0
      ? Math.round(clients.reduce((s, c) => s + c.complianceScore, 0) / clients.length)
      : 100;

  const healthyCount = clients.filter((c) => c.complianceScore >= 70).length;
  const atRiskCount = clients.filter((c) => c.complianceScore >= 40 && c.complianceScore < 70).length;
  const criticalCount = clients.filter((c) => c.complianceScore < 40).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">MSP Portfolio</h1>
          <p className="mt-1 text-sm text-muted">
            Security status across all managed clients.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/msp/clients"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading transition hover:bg-surface-raised"
          >
            Manage Clients
          </Link>
          <Link
            href="/dashboard/msp/clients?invite=true"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Add Client
          </Link>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Clients", value: clients.length, sub: null },
          { label: "Total Apps", value: totalApps, sub: "across all clients" },
          { label: "Overall Compliance", value: `${overallScore}%`, sub: "portfolio average" },
          { label: "Critical Findings", value: totalCritical, sub: `${totalOpenFindings} total open` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface-raised p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-heading">{stat.value}</p>
            {stat.sub && <p className="mt-1 text-xs text-muted">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* RAG Summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-success/20 bg-success/5 p-6 text-center">
          <p className="text-3xl font-bold text-success">{healthyCount}</p>
          <p className="mt-1 text-sm font-medium text-success">Healthy</p>
          <p className="mt-1 text-xs text-muted">Score 70+</p>
        </div>
        <div className="rounded-2xl border border-warning/20 bg-warning/5 p-6 text-center">
          <p className="text-3xl font-bold text-warning">{atRiskCount}</p>
          <p className="mt-1 text-sm font-medium text-warning">At Risk</p>
          <p className="mt-1 text-xs text-muted">Score 40-69</p>
        </div>
        <div className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center">
          <p className="text-3xl font-bold text-error">{criticalCount}</p>
          <p className="mt-1 text-sm font-medium text-error">Critical</p>
          <p className="mt-1 text-xs text-muted">Score below 40</p>
        </div>
      </div>

      {/* Client Table */}
      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-semibold text-heading">No clients yet</p>
          <p className="mt-2 text-sm text-muted">
            Add your first client to start monitoring their apps from this portal.
          </p>
          <Link
            href="/dashboard/msp/clients?invite=true"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Add First Client
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface-raised">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-heading">Client Status</h2>
            <p className="text-xs text-muted">Sorted by severity — worst first.</p>
          </div>
          <div className="divide-y divide-border">
            {clients.map((client) => (
              <div
                key={client.orgId}
                className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${ragColor(client.complianceScore)} bg-surface border border-border`}>
                    {client.grade}
                  </div>
                  <div>
                    <p className="font-semibold text-heading">{client.orgName}</p>
                    <p className="text-xs text-muted">
                      {client.totalApps} app{client.totalApps !== 1 ? "s" : ""}
                      {client.lastScanAt && (
                        <> &middot; Last scan {client.lastScanAt.toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted">Score</p>
                    <p className={`text-base font-bold ${ragColor(client.complianceScore)}`}>
                      {client.complianceScore}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Critical</p>
                    <p className={`text-base font-bold ${client.criticalFindings > 0 ? "text-error" : "text-muted"}`}>
                      {client.criticalFindings}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Open</p>
                    <p className="text-base font-bold text-heading">{client.totalOpenFindings}</p>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ragBadge(client.complianceScore)}`}>
                    {ragLabel(client.complianceScore)}
                  </span>

                  <div className="flex gap-2">
                    <a
                      href={`/api/msp/report?clientOrgId=${client.orgId}`}
                      className="rounded border border-border px-2 py-1 text-xs font-medium text-muted transition hover:text-heading"
                      title="Download co-branded report"
                    >
                      Report
                    </a>
                    <Link
                      href={`/dashboard/msp/clients/${client.orgSlug}`}
                      className="rounded border border-border px-2 py-1 text-xs font-medium text-muted transition hover:text-heading"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
