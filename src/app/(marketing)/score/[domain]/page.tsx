/**
 * /score/[domain] . Shareable Security Score Card
 *
 * Public, no-auth page showing a read-only security score for any monitored app.
 * Fetches the latest MonitorRun for the domain from the database and renders
 * a grade card with Open Graph meta for social sharing.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

// ─── Scoring helpers ──────────────────────────────────────────────────────────

const SEVERITY_DEDUCTION: Record<string, number> = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 5,
  LOW: 2,
};

function computeScore(findings: { severity: string; status: string }[]): number {
  let score = 100;
  for (const f of findings) {
    // Only count open / in-progress / acknowledged findings against the score
    if (f.status === "RESOLVED" || f.status === "IGNORED") continue;
    score -= SEVERITY_DEDUCTION[f.severity] ?? 2;
  }
  return Math.max(0, score);
}

function computeGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  if (grade === "A" || grade === "B") return "#16a34a"; // green-600
  if (grade === "C") return "#ca8a04"; // yellow-600
  if (grade === "D") return "#ea580c"; // orange-600
  return "#dc2626"; // red-600
}

function gradeBg(grade: string): string {
  if (grade === "A" || grade === "B") return "#f0fdf4"; // green-50
  if (grade === "C") return "#fefce8"; // yellow-50
  if (grade === "D") return "#fff7ed"; // orange-50
  return "#fef2f2"; // red-50
}

function relativeDate(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

// ─── Domain matching ──────────────────────────────────────────────────────────

function apexDomain(input: string): string {
  try {
    const u = input.startsWith("http") ? new URL(input) : new URL(`https://${input}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return input.toLowerCase().replace(/^www\./, "");
  }
}

// ─── Data fetching ────────────────────────────────────────────────────────────

interface ScoreData {
  appName: string;
  appUrl: string;
  domain: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  findings: { title: string; severity: string }[];
  findingsCount: number;
  scannedAt: Date;
}

async function getScoreData(domainParam: string): Promise<ScoreData | null> {
  const apex = apexDomain(domainParam);

  // Fuzzy lookup: find apps whose URL contains the apex domain
  const apps = await db.monitoredApp.findMany({
    where: {
      url: { contains: apex },
    },
    include: {
      monitorRuns: {
        where: { completedAt: { not: null } },
        orderBy: { startedAt: "desc" },
        take: 1,
        include: {
          findings: {
            orderBy: { severity: "asc" },
            select: { title: true, severity: true, status: true },
          },
        },
      },
    },
    take: 5,
  });

  if (apps.length === 0) return null;

  // Pick the app with the most recent completed run
  let bestApp = null as typeof apps[0] | null;
  let bestRunDate = new Date(0);

  for (const app of apps) {
    const run = app.monitorRuns[0];
    if (run?.completedAt && new Date(run.completedAt) > bestRunDate) {
      bestRunDate = new Date(run.completedAt);
      bestApp = app;
    }
  }

  if (!bestApp || !bestApp.monitorRuns[0]) return null;

  const run = bestApp.monitorRuns[0];
  const score = computeScore(run.findings);
  const grade = computeGrade(score);

  // Count all open findings
  const openFindings = run.findings.filter(
    (f) => f.status !== "RESOLVED" && f.status !== "IGNORED"
  );
  const findingsCount = openFindings.length;

  // Top 3 findings (most severe first)
  const topFindings = openFindings
    .slice(0, 3)
    .map((f) => ({ title: f.title, severity: f.severity }));

  return {
    appName: bestApp.name,
    appUrl: bestApp.url,
    domain: apex,
    score,
    grade,
    findings: topFindings,
    findingsCount,
    scannedAt: run.completedAt ?? run.startedAt,
  };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const data = await getScoreData(domain);

  if (!data) {
    return {
      title: `${domain} . Security Score | Scantient`,
      description: `${domain} isn't currently monitored by Scantient. Scan it free to get a security grade.`,
      openGraph: {
        title: `${domain} . Not yet monitored | Scantient`,
        description: "Scan this domain free to get a security grade.",
        url: `https://scantient.com/score/${domain}`,
      },
    };
  }

  const { grade, score } = data;
  return {
    title: `${domain} . Grade ${grade} (${score}/100) | Scantient`,
    description: `${domain} has a security score of ${score}/100 (Grade ${grade}). Monitored by Scantient.`,
    openGraph: {
      title: `${domain} . Security Grade ${grade} · ${score}/100`,
      description: `This site scored ${score}/100 (Grade ${grade}) on Scantient's security scan. ${data.findings.length > 0 ? `Top issue: ${data.findings[0].title}` : "No open issues found."}`,
      url: `https://scantient.com/score/${domain}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${domain} . Security Grade ${grade} · ${score}/100`,
      description: `Scantient security score for ${domain}.`,
    },
  };
}

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityPill({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    CRITICAL: "bg-error/10 text-error",
    HIGH: "bg-warning/10 text-warning",
    MEDIUM: "bg-warning/10 text-warning",
    LOW: "bg-surface-raised text-muted",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${map[severity] ?? map.LOW}`}>
      {severity}
    </span>
  );
}

// ─── Upgrade CTA section ──────────────────────────────────────────────────────

function UpgradeCTASection({ findingsCount, domain }: { findingsCount: number; domain: string }) {
  const hasIssues = findingsCount > 0;

  return (
    <div className="space-y-4">
      {/* "What happens next?" callout */}
      <div className="rounded-xl border-2 border-warning/20 bg-warning/10 px-5 py-4">
        <h2 className="text-base font-bold text-heading">
          {hasIssues
            ? `⚠️ ${findingsCount} issue${findingsCount !== 1 ? "s" : ""} found. What happens next?`
            : "✅ No issues today. What about tomorrow?"}
        </h2>
        <p className="mt-1 text-sm text-heading">
          {hasIssues
            ? "This is a one-time snapshot. These issues could change, worsen, or new ones could appear . and you won't know."
            : "Clean scans can change. A new deploy, an expired cert, a misconfigured header. Without monitoring, you'll find out too late."}
        </p>
      </div>

      {/* Comparison: Free vs LTD vs Pro */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-heading">What you get vs. what you&apos;re missing</h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-raised">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Feature</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">Free Scan</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-prussian-blue-600 dark:text-prussian-blue-400 bg-prussian-blue-50 dark:bg-prussian-blue-950/20">
                  LTD . $79
                  <span className="ml-1 text-[10px] font-bold text-prussian-blue-500 dark:text-prussian-blue-400">once</span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">Pro $399/mo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { feature: "One-time scan", free: true, ltd: true, pro: true },
                { feature: "Continuous daily monitoring", free: false, ltd: true, pro: true },
                { feature: "Email alerts on new issues", free: false, ltd: true, pro: true },
                { feature: "SSL expiry warnings", free: false, ltd: true, pro: true },
                { feature: "Monthly compliance reports", free: false, ltd: true, pro: true },
                { feature: "Unlimited re-scans", free: false, ltd: true, pro: true },
                { feature: "Team access", free: false, ltd: false, pro: true },
                { feature: "Custom scan rules", free: false, ltd: false, pro: true },
                { feature: "SLA guarantee", free: false, ltd: false, pro: true },
              ].map((row) => (
                <tr key={row.feature} className="hover:bg-surface-raised/50">
                  <td className="px-4 py-2.5 text-sm text-heading">{row.feature}</td>
                  <td className="px-4 py-2.5 text-center text-base">
                    {row.free ? "✅" : <span className="text-muted">✗</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center text-base bg-prussian-blue-50/50 dark:bg-prussian-blue-950/10">
                    {row.ltd ? "✅" : <span className="text-muted">✗</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center text-base">
                    {row.pro ? "✅" : <span className="text-muted">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main CTA */}
      <div className="rounded-xl border-2 border-prussian-blue-200 dark:border-prussian-blue-700 bg-gradient-to-br from-prussian-blue-50 to-white dark:from-prussian-blue-950/40 dark:to-surface px-6 py-6 text-center">
        {/* Social proof */}
        <p className="text-xs font-medium text-prussian-blue-600 dark:text-prussian-blue-400 mb-3">
          🔒 Join indie devs and startup teams shipping securely with Scantient
        </p>

        <h3 className="text-lg font-bold text-heading">
          Lock in lifetime monitoring for{" "}
          <span className="text-prussian-blue-600 dark:text-prussian-blue-400">$79</span>
        </h3>
        <p className="mt-1 text-sm text-muted">
          One payment. Monitors <strong>{domain}</strong> every day. Alerts you before attackers find issues.
        </p>

        {/* Urgency */}
        <p className="mt-2 text-xs font-medium text-warning">
          ⏳ LTD pricing won&apos;t last forever . lock in $79 before it goes monthly-only
        </p>

        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-lg bg-prussian-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-prussian-blue-700 hover:shadow-xl"
          >
            Get Lifetime Access . $79 →
          </Link>
          <Link
            href="/score"
            className="text-sm text-muted hover:text-heading transition"
          >
            Or scan another domain free
          </Link>
        </div>

        <p className="mt-3 text-xs text-muted">No subscription. No surprises. Cancel-free forever.</p>
      </div>

      {/* Value points below CTA */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: "📡", title: "Daily scans", desc: "Runs automatically, every day" },
          { icon: "🔔", title: "Instant alerts", desc: "Email when issues appear" },
          { icon: "📄", title: "PDF reports", desc: "Compliance-ready, monthly" },
          { icon: "♾️", title: "Lifetime deal", desc: "Pay once, monitor forever" },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-surface p-3 text-center">
            <div className="text-xl">{item.icon}</div>
            <p className="mt-1 text-xs font-semibold text-heading">{item.title}</p>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ScoreCardPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const data = await getScoreData(domain);

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        {data ? (
          <FoundCard data={data} />
        ) : (
          <NotFoundCard domain={domain} />
        )}
      </main>
    </>
  );
}

// ─── Found state ──────────────────────────────────────────────────────────────

function FoundCard({ data }: { data: ScoreData }) {
  const color = gradeColor(data.grade);
  const bg = gradeBg(data.grade);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted">Security score for</p>
        <h1 className="mt-1 text-2xl font-bold text-heading">{data.domain}</h1>
      </div>

      {/* Grade circle + score */}
      <div
        className="flex flex-col items-center justify-center rounded-2xl border py-12"
        style={{ background: bg, borderColor: color + "33" }}
      >
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full border-4 text-5xl font-extrabold shadow-sm"
          style={{ borderColor: color, color, background: "white" }}
        >
          {data.grade}
        </div>
        <p className="mt-4 text-4xl font-bold" style={{ color }}>
          {data.score}
          <span className="text-lg font-normal text-muted">/100</span>
        </p>
        <p className="mt-2 text-sm text-muted">
          Last scanned: {relativeDate(new Date(data.scannedAt))}
        </p>
        <p className="mt-1 text-xs text-muted">
          Continuously monitored by{" "}
          <Link href="https://scantient.com" className="font-semibold text-heading hover:underline">
            Scantient
          </Link>
        </p>
      </div>

      {/* Top findings */}
      {data.findings.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-heading">Top findings</h2>
            {data.findingsCount > data.findings.length && (
              <span className="text-xs text-muted">
                {data.findingsCount} total issues
              </span>
            )}
          </div>
          <ul className="divide-y">
            {data.findings.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm text-heading">{f.title}</span>
                <SeverityPill severity={f.severity} />
              </li>
            ))}
          </ul>
          {data.findingsCount > data.findings.length && (
            <div className="border-t px-4 py-2 text-center">
              <p className="text-xs text-muted">
                + {data.findingsCount - data.findings.length} more issues hidden
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-4 text-center">
          <p className="text-sm font-medium text-success">✅ No open issues found</p>
        </div>
      )}

      {/* ── Conversion funnel ── */}
      <UpgradeCTASection findingsCount={data.findingsCount} domain={data.domain} />

      {/* Blog education links */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Learn about security best practices</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/blog/7-api-security-mistakes" className="rounded-md bg-surface-raised px-3 py-1.5 text-xs font-medium text-heading hover:bg-border transition">
            7 API security mistakes →
          </Link>
          <Link href="/blog/indie-dev-security-checklist" className="rounded-md bg-surface-raised px-3 py-1.5 text-xs font-medium text-heading hover:bg-border transition">
            Security checklist →
          </Link>
          <Link href="/blog/why-ctos-choose-external-security-scanning" className="rounded-md bg-surface-raised px-3 py-1.5 text-xs font-medium text-heading hover:bg-border transition">
            Why external scanning matters →
          </Link>
        </div>
      </div>

      {/* Scan your own app CTA */}
      <div className="text-center">
        <Link
          href="/score"
          className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Scan your own app free →
        </Link>
      </div>
    </div>
  );
}

// ─── Not found state ──────────────────────────────────────────────────────────

function NotFoundCard({ domain }: { domain: string }) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-raised text-4xl">
          🔍
        </div>
        <div>
          <h1 className="text-xl font-bold text-heading">
            {domain} isn&apos;t monitored yet
          </h1>
          <p className="mt-2 text-sm text-muted">
            Run a free instant scan to get a security grade . no account needed.
          </p>
        </div>
        <Link
          href={`/score?url=https://${domain}`}
          className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Scan it free →
        </Link>
        <p className="text-xs text-muted">
          Free · Instant · No account required
        </p>
      </div>

      {/* Upgrade pitch for unmonitored domain */}
      <div className="rounded-xl border-2 border-prussian-blue-200 dark:border-prussian-blue-700 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 px-6 py-5">
        <h2 className="text-base font-bold text-heading text-center mb-1">
          Want <em>continuous</em> protection for {domain}?
        </h2>
        <p className="text-sm text-muted text-center mb-4">
          A one-time scan tells you where you stand today. Continuous monitoring tells you the moment something breaks.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { icon: "📡", label: "Daily automated scans" },
            { icon: "🔔", label: "Email alerts on changes" },
            { icon: "📄", label: "Monthly compliance PDFs" },
            { icon: "♾️", label: "Lifetime . pay once" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-heading">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs font-medium text-warning">
            ⏳ LTD pricing won&apos;t last forever . lock in $79 before it goes monthly-only
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-lg bg-prussian-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-prussian-blue-700"
          >
            Get Lifetime Access . $79 →
          </Link>
          <p className="text-xs text-muted">No subscription. No surprises.</p>
        </div>
      </div>

      {/* Scan free nudge */}
      <p className="text-xs text-muted text-center">
        Not ready to commit? Start with a{" "}
        <Link href={`/score?url=https://${domain}`} className="font-medium text-heading underline">
          free instant scan
        </Link>{" "}
        and upgrade after you see the results.
      </p>

      {/* Powered by */}
      <div className="rounded-xl border border-border bg-surface px-4 py-4">
        <p className="text-xs text-muted text-center">
          Powered by{" "}
          <Link href="https://scantient.com" className="font-semibold text-heading hover:underline">
            Scantient
          </Link>
          {" "}· Security monitoring for any web app
        </p>
      </div>
    </div>
  );
}
