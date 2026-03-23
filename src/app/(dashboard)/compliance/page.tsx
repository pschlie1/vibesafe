export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { db } from "@/lib/db";
import {
  getSOC2Controls,
  getOWASPMapping,
  getNISTMapping,
  frameworkPassRate,
} from "@/lib/compliance-frameworks";
import { ComplianceShareButton } from "@/components/compliance-share-button";

const PRO_TIERS = ["PRO", "ENTERPRISE", "ENTERPRISE_PLUS"];
const ENTERPRISE_TIERS = ["ENTERPRISE", "ENTERPRISE_PLUS"];

function statusColor(status: string): string {
  if (status === "pass") return "text-success";
  if (status === "fail") return "text-error";
  return "text-warning";
}

function statusBadge(status: string): string {
  if (status === "pass") return "bg-success/10 text-success";
  if (status === "fail") return "bg-error/10 text-error";
  return "bg-warning/10 text-warning";
}

function statusLabel(status: string): string {
  if (status === "pass") return "Pass";
  if (status === "fail") return "Fail";
  return "Partial";
}

function scoreBar(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-error";
}

export default async function CompliancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const limits = await getOrgLimits(session.orgId);

  // Gate to PRO+ in UI
  if (!PRO_TIERS.includes(limits.tier)) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-xl border-2 border-dashed border-border p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised text-3xl">
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-heading">Compliance Dashboard</h1>
          <p className="mt-3 text-muted">
            The Compliance Dashboard is available on PRO and Enterprise plans. Upgrade to
            track SOC 2, OWASP Top 10, and NIST CSF controls in real time.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/pricing"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Upgrade to PRO
            </Link>
            <Link href="/dashboard" className="text-sm text-muted hover:text-heading">
              Back to dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted">
            Current plan: <strong>{limits.tier}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Load open findings
  const openFindings = await db.finding.findMany({
    where: {
      status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
      run: { app: { orgId: session.orgId } },
    },
    select: { code: true, title: true, severity: true },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  const findingInputs = openFindings.map((f) => ({
    code: f.code,
    title: f.title,
    severity: f.severity,
  }));

  // Framework results
  const soc2Controls = getSOC2Controls(findingInputs);
  const owaspCategories = getOWASPMapping(findingInputs);
  const nistFunctions = getNISTMapping(findingInputs);

  const soc2Score = frameworkPassRate(soc2Controls);
  const owaspScore = frameworkPassRate(owaspCategories);
  const nistScore = frameworkPassRate(nistFunctions);

  // Score trend (last 30 days — one entry per day with open finding count)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRuns = await db.monitorRun.findMany({
    where: {
      app: { orgId: session.orgId },
      startedAt: { gte: thirtyDaysAgo },
    },
    select: {
      startedAt: true,
      findings: {
        where: { status: { notIn: ["RESOLVED", "IGNORED"] } },
        select: { severity: true },
      },
    },
    orderBy: { startedAt: "asc" },
  });

  // Bucket by day and compute a simple aggregate score per day
  const dayMap = new Map<string, number[]>();
  for (const run of recentRuns) {
    const day = run.startedAt.toISOString().slice(0, 10);
    const penalty = run.findings.reduce((sum, f) => {
      if (f.severity === "CRITICAL") return sum + 25;
      if (f.severity === "HIGH") return sum + 10;
      if (f.severity === "MEDIUM") return sum + 3;
      return sum + 1;
    }, 0);
    const score = Math.max(0, 100 - penalty);
    const existing = dayMap.get(day) ?? [];
    existing.push(score);
    dayMap.set(day, existing);
  }

  const trend = Array.from(dayMap.entries())
    .map(([day, scores]) => ({
      day,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-30);

  const isEnterprise = ENTERPRISE_TIERS.includes(limits.tier);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Compliance Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            SOC 2, OWASP Top 10, and NIST CSF mapped to your open findings.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/reports/pdf"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading transition hover:bg-surface-raised"
          >
            Download PDF Report
          </a>
          {isEnterprise && (
            <>
              <a
                href="/api/compliance/evidence"
                download="evidence-package.json"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading transition hover:bg-surface-raised"
              >
                Download Evidence Package
              </a>
              <ComplianceShareButton />
            </>
          )}
          {!isEnterprise && (
            <Link
              href="/pricing"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
            >
              Upgrade for Evidence Package
            </Link>
          )}
        </div>
      </div>

      {/* Framework Score Summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { name: "SOC 2", subtitle: "Trust Services Criteria", score: soc2Score, controls: soc2Controls },
          { name: "OWASP Top 10", subtitle: "2021 Categories", score: owaspScore, controls: owaspCategories },
          { name: "NIST CSF", subtitle: "Cybersecurity Framework 2.0", score: nistScore, controls: nistFunctions },
        ].map((fw) => {
          const passed = fw.controls.filter((c) => c.status === "pass").length;
          const total = fw.controls.length;
          return (
            <div
              key={fw.name}
              className="rounded-2xl border border-border bg-surface-raised p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                {fw.name}
              </p>
              <p className="mt-0.5 text-xs text-muted">{fw.subtitle}</p>
              <div className="mt-4 flex items-end gap-3">
                <span className={`text-4xl font-bold ${statusColor(fw.score >= 80 ? "pass" : fw.score >= 50 ? "partial" : "fail")}`}>
                  {fw.score}%
                </span>
                <span className="mb-1 text-sm text-muted">
                  {passed}/{total} controls passing
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full transition-all ${scoreBar(fw.score)}`}
                  style={{ width: `${fw.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Score Trend */}
      {trend.length > 1 && (
        <div className="rounded-2xl border border-border bg-surface-raised p-6">
          <h2 className="text-base font-semibold text-heading">Compliance Score Trend (30 days)</h2>
          <p className="mt-1 text-xs text-muted">Average security score per day across all apps.</p>
          <div className="mt-6 flex h-24 items-end gap-1">
            {trend.map((entry) => (
              <div
                key={entry.day}
                className="group relative flex flex-1 flex-col items-center"
              >
                <div
                  className={`w-full rounded-t ${scoreBar(entry.score)} opacity-80 transition-opacity group-hover:opacity-100`}
                  style={{ height: `${Math.max(4, (entry.score / 100) * 96)}px` }}
                  title={`${entry.day}: ${entry.score}%`}
                />
                <span className="absolute -top-5 hidden text-xs font-semibold text-heading group-hover:block">
                  {entry.score}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>{trend[0]?.day ?? ""}</span>
            <span>{trend[trend.length - 1]?.day ?? ""}</span>
          </div>
        </div>
      )}

      {/* SOC 2 Controls */}
      <div className="rounded-2xl border border-border bg-surface-raised p-6">
        <h2 className="text-base font-semibold text-heading">SOC 2 Trust Services Criteria</h2>
        <p className="mt-1 text-xs text-muted">
          Each control shows whether open findings violate its requirements.
        </p>
        <div className="mt-4 divide-y divide-border">
          {soc2Controls.map((c) => (
            <div key={c.controlId} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm font-semibold text-heading">{c.controlId}</span>
                <span className="ml-2 text-sm text-muted">{c.control.name}</span>
                {c.violatingFindings.length > 0 && (
                  <p className="mt-0.5 text-xs text-error">
                    Violated by: {c.violatingFindings.join(", ")}
                  </p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(c.status)}`}>
                {statusLabel(c.status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* OWASP Top 10 */}
      <div className="rounded-2xl border border-border bg-surface-raised p-6">
        <h2 className="text-base font-semibold text-heading">OWASP Top 10 (2021)</h2>
        <p className="mt-1 text-xs text-muted">
          Maps your findings to the industry-standard web application risk categories.
        </p>
        <div className="mt-4 divide-y divide-border">
          {owaspCategories.map((c) => (
            <div key={c.categoryId} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm font-semibold text-heading">{c.categoryId}</span>
                <span className="ml-2 text-sm text-muted">{c.category.name}</span>
                {c.violatingFindings.length > 0 && (
                  <p className="mt-0.5 text-xs text-error">
                    Violated by: {c.violatingFindings.join(", ")}
                  </p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(c.status)}`}>
                {statusLabel(c.status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NIST CSF */}
      <div className="rounded-2xl border border-border bg-surface-raised p-6">
        <h2 className="text-base font-semibold text-heading">NIST CSF 2.0</h2>
        <p className="mt-1 text-xs text-muted">
          Maps your findings to NIST Cybersecurity Framework functions.
        </p>
        <div className="mt-4 divide-y divide-border">
          {nistFunctions.map((fn) => (
            <div key={fn.functionId} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm font-semibold text-heading">{fn.functionId}</span>
                <span className="ml-2 text-sm text-muted">{fn.function.name}</span>
                <p className="mt-0.5 text-xs text-muted">{fn.function.description}</p>
                {fn.violatingFindings.length > 0 && (
                  <p className="mt-0.5 text-xs text-error">
                    Violated by: {fn.violatingFindings.join(", ")}
                  </p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(fn.status)}`}>
                {statusLabel(fn.status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise upsell for evidence package */}
      {!isEnterprise && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-base font-semibold text-heading">Need audit-ready evidence?</p>
          <p className="mt-2 text-sm text-muted">
            Enterprise plans include a downloadable evidence package with control-by-control
            breakdowns, finding timestamps, and scan history. Share a read-only link with your
            auditor in one click.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Upgrade to Enterprise
          </Link>
        </div>
      )}
    </div>
  );
}
