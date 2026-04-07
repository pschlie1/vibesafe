export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MspInviteButton } from "@/components/msp-invite-button";

function computeComplianceScore(findings: { severity: string }[]): number {
  const penalty = findings.reduce((sum, f) => {
    if (f.severity === "CRITICAL") return sum + 25;
    if (f.severity === "HIGH") return sum + 10;
    if (f.severity === "MEDIUM") return sum + 3;
    return sum + 1;
  }, 0);
  return Math.max(0, 100 - penalty);
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-error";
}

function formatDate(d: Date | null): string {
  if (!d) return "Never";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function MspClientsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const clientOrgs = await db.organization.findMany({
    where: { parentOrgId: session.orgId },
    orderBy: { name: "asc" },
    include: {
      apps: {
        select: {
          id: true,
          name: true,
          url: true,
          lastCheckedAt: true,
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
      users: {
        take: 3,
        select: { name: true, email: true },
      },
    },
  });

  type ClientEntry = {
    orgId: string;
    orgName: string;
    orgSlug: string;
    appCount: number;
    openFindings: number;
    criticalFindings: number;
    complianceScore: number;
    lastScanAt: Date | null;
    memberEmails: string[];
  };

  const clients: ClientEntry[] = clientOrgs.map((org) => {
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

    return {
      orgId: org.id,
      orgName: org.name,
      orgSlug: org.slug,
      appCount: org.apps.length,
      openFindings: allOpenFindings.length,
      criticalFindings: allOpenFindings.filter((f) => f.severity === "CRITICAL").length,
      complianceScore: computeComplianceScore(allOpenFindings),
      lastScanAt,
      memberEmails: org.users.map((u) => u.email ?? u.name ?? "").filter(Boolean),
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Client Management</h1>
          <p className="mt-1 text-sm text-muted">
            {clients.length} client{clients.length !== 1 ? "s" : ""} in your MSP portal.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/msp"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-heading"
          >
            Portfolio View
          </Link>
          <MspInviteButton />
        </div>
      </div>

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised text-3xl">
            🏢
          </div>
          <h2 className="text-lg font-semibold text-heading">No clients yet</h2>
          <p className="mt-2 text-sm text-muted">
            Invite a client organization to start managing their apps from this portal.
          </p>
          <div className="mt-6">
            <MspInviteButton />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.orgId}
              className="rounded-2xl border border-border bg-surface-raised p-6"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Name + Members */}
                <div className="flex-1">
                  <Link
                    href={`/dashboard/msp/clients/${client.orgSlug}`}
                    className="text-base font-semibold text-heading hover:text-primary transition-colors"
                  >
                    {client.orgName}
                  </Link>
                  {client.memberEmails.length > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      {client.memberEmails.join(", ")}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-muted">Apps</p>
                    <p className="text-base font-bold text-heading">{client.appCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Open Findings</p>
                    <p className="text-base font-bold text-heading">{client.openFindings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Critical</p>
                    <p className={`text-base font-bold ${client.criticalFindings > 0 ? "text-error" : "text-muted"}`}>
                      {client.criticalFindings}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Score</p>
                    <p className={`text-base font-bold ${scoreColor(client.complianceScore)}`}>
                      {client.complianceScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Last Scan</p>
                    <p className="text-sm font-medium text-heading">{formatDate(client.lastScanAt)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`/api/msp/report?clientOrgId=${client.orgId}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-heading"
                    title="Download co-branded PDF report"
                  >
                    Report
                  </a>
                  <Link
                    href={`/dashboard/msp/clients/${client.orgSlug}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-heading"
                  >
                    View Apps
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Explainer */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-heading">How to add a client</h3>
        <ol className="mt-3 space-y-2 text-sm text-muted">
          <li className="flex gap-3">
            <span className="font-semibold text-heading">1.</span>
            Click "Add Client" to send an invite to your client's email address.
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-heading">2.</span>
            Your client accepts the invite and their organization links to your MSP portal.
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-heading">3.</span>
            Their apps and findings appear in your portfolio view automatically.
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-heading">4.</span>
            Generate co-branded reports to share with your client in one click.
          </li>
        </ol>
      </div>
    </div>
  );
}
