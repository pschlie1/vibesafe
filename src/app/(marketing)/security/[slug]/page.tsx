/**
 * /security/[slug] — Public Security Transparency Page
 *
 * Where the badge links to. Anyone can view this without an account.
 * Shows sanitised security posture: org score, per-app grade, open finding
 * titles + severities. No descriptions or fix guidance exposed.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { calcScore, scoreToGrade, scoreToColor } from "@/app/api/public/badge/route";
import { relativeTime } from "@/lib/time";

// ─── Types ────────────────────────────────────────────────────────────────────

type Finding = { title: string; severity: string };

type AppResult = {
  name: string;
  host: string;
  score: number;
  grade: string;
  status: string;
  lastCheckedAt: Date | null;
  scanCompletedAt: Date | null;
  findingCounts: Record<string, number>;
  openFindings: Finding[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  CRITICAL: { bg: "bg-error/10", text: "text-error", dot: "bg-error" },
  HIGH:     { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  MEDIUM:   { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-500" },
  LOW:      { bg: "bg-surface-raised", text: "text-muted", dot: "bg-border" },
};

function gradeRingColor(grade: string) {
  if (grade === "A") return "text-success border-success/40";
  if (grade === "B") return "text-success border-success/40";
  if (grade === "C") return "text-yellow-600 border-yellow-400/40";
  if (grade === "D") return "text-warning border-warning/40";
  return "text-error border-error/40";
}

function statusLabel(status: string) {
  if (status === "HEALTHY") return { label: "Healthy", color: "bg-success/10 text-success" };
  if (status === "FAILING") return { label: "Issues found", color: "bg-error/10 text-error" };
  return { label: "Monitoring", color: "bg-info/10 text-info" };
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getOrgData(slug: string) {
  const org = await db.organization.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!org) return null;

  const apps = await db.monitoredApp.findMany({
    where: { orgId: org.id },
    select: {
      name: true,
      url: true,
      lastCheckedAt: true,
      status: true,
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          completedAt: true,
          findings: {
            select: { title: true, severity: true, status: true },
            where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
            orderBy: [{ severity: "asc" }, { title: "asc" }],
          },
        },
      },
    },
  });

  const results: AppResult[] = apps.map((app) => {
    const latestRun = app.monitorRuns[0] ?? null;
    const findings = latestRun?.findings ?? [];
    const score = calcScore(findings);
    const grade = scoreToGrade(score);

    const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const f of findings) if (f.severity in counts) counts[f.severity]++;

    let host = app.url;
    try { host = new URL(app.url.startsWith("http") ? app.url : `https://${app.url}`).hostname; } catch {}

    return {
      name: app.name,
      host,
      score,
      grade,
      status: app.status,
      lastCheckedAt: app.lastCheckedAt,
      scanCompletedAt: latestRun?.completedAt ?? null,
      findingCounts: counts,
      openFindings: findings.map((f) => ({ title: f.title, severity: f.severity })),
    };
  });

  const scores = results.map((a) => a.score);
  const orgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const orgGrade = orgScore !== null ? scoreToGrade(orgScore) : null;

  return { org, orgScore, orgGrade, apps: results };
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getOrgData(slug);
  if (!data) return { title: "Security Report | Scantient" };

  const { org, orgScore, orgGrade } = data;
  const title = `${org.name} Security Report | Scantient`;
  const description = orgScore !== null
    ? `${org.name} has a security score of ${orgScore}/100 (Grade ${orgGrade}). Powered by continuous API security monitoring from Scantient.`
    : `Security posture report for ${org.name}. Powered by Scantient.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: "Scantient" },
    twitter: { card: "summary", title, description },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SecurityTransparencyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getOrgData(slug);
  if (!data) notFound();

  const { org, orgScore, orgGrade, apps } = data;
  const totalCritical = apps.reduce((a, app) => a + (app.findingCounts.CRITICAL ?? 0), 0);
  const totalHigh = apps.reduce((a, app) => a + (app.findingCounts.HIGH ?? 0), 0);
  const mostRecentScan = apps
    .map((a) => a.scanCompletedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

  return (
    <main className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b border-border bg-surface px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-heading">
            Scantient
          </Link>
          <span className="text-xs text-muted">Security transparency report</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Org header */}
        <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Security report</p>
            <h1 className="text-3xl font-bold text-heading">{org.name}</h1>
            {mostRecentScan && (
              <p className="mt-1.5 text-sm text-muted">
                Last scanned {relativeTime(mostRecentScan)}
              </p>
            )}
          </div>

          {/* Org score ring */}
          {orgScore !== null && orgGrade && (
            <div className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 ${gradeRingColor(orgGrade)}`}>
              <span className="text-4xl font-black">{orgGrade}</span>
              <span className="text-xs font-semibold text-muted">{orgScore}/100</span>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Apps monitored", value: apps.length },
            {
              label: "Critical findings",
              value: totalCritical,
              highlight: totalCritical > 0 ? "text-error" : "text-success",
            },
            {
              label: "High findings",
              value: totalHigh,
              highlight: totalHigh > 0 ? "text-warning" : "text-success",
            },
            {
              label: "Overall grade",
              value: orgGrade ?? "—",
              highlight: orgGrade && ["A", "B"].includes(orgGrade) ? "text-success" : "text-warning",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-surface px-5 py-4">
              <p className={`text-2xl font-bold ${s.highlight ?? "text-heading"}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Per-app cards */}
        <h2 className="mb-4 text-lg font-semibold text-heading">Monitored applications</h2>
        <div className="space-y-4">
          {apps.map((app) => {
            const st = statusLabel(app.status);
            const hasFindings = app.openFindings.length > 0;

            return (
              <div key={app.name} className="rounded-xl border border-border bg-surface overflow-hidden">
                {/* App header row */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Grade badge */}
                    <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 text-sm font-bold ${gradeRingColor(app.grade)}`}>
                      {app.grade}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-heading truncate">{app.name}</p>
                      <p className="text-xs text-muted truncate">{app.host}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                    {app.lastCheckedAt && (
                      <span className="text-xs text-muted">
                        Scanned {relativeTime(app.lastCheckedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Severity summary pills */}
                <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-surface-raised/50">
                  {SEVERITY_ORDER.map((sev) => {
                    const count = app.findingCounts[sev] ?? 0;
                    const colors = SEVERITY_COLORS[sev];
                    return (
                      <span
                        key={sev}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                        {count} {sev.charAt(0) + sev.slice(1).toLowerCase()}
                      </span>
                    );
                  })}
                  {!hasFindings && (
                    <span className="text-xs text-success font-medium">✓ No open findings</span>
                  )}
                </div>

                {/* Finding list — title + severity only, no descriptions */}
                {hasFindings && (
                  <div className="divide-y divide-border px-6">
                    {app.openFindings.map((f, i) => {
                      const colors = SEVERITY_COLORS[f.severity] ?? SEVERITY_COLORS.LOW;
                      return (
                        <div key={i} className="flex items-center gap-3 py-3">
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                            {f.severity}
                          </span>
                          <span className="text-sm text-body">{f.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-10 rounded-lg border border-border bg-surface-raised px-6 py-5 text-sm text-muted">
          <p className="font-medium text-body mb-1">About this report</p>
          <p>
            This security report is generated by{" "}
            <a href="https://scantient.com" className="text-info hover:underline">Scantient</a>,
            an external API security scanner. It reflects open findings from the most recent automated scan.
            Finding descriptions and remediation details are not disclosed publicly.
            Resolved and dismissed findings are excluded.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted mb-3">Want a security report for your own apps?</p>
          <Link
            href="/score"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Run a free scan →
          </Link>
        </div>
      </div>
    </main>
  );
}
