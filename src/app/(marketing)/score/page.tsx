"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type ScoreFinding = {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
};

type ScoreResult = {
  url: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  status: "healthy" | "warning" | "critical";
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  findings: ScoreFinding[];
  scannedAt: string;
  upgradeUrl: string;
  message: string;
  error?: string;
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-error/10 text-error border-error",
  HIGH: "bg-warning/10 text-warning border-warning/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  LOW: "bg-info/10 text-info border-info/20",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-success/10 border-success/20";
  if (score >= 50) return "bg-warning/10 border-warning/20";
  return "bg-error/10 border-error";
}

function gradeColor(grade: string) {
  if (grade === "A") return "bg-success/10 text-success";
  if (grade === "B") return "bg-success/10 text-success";
  if (grade === "C") return "bg-warning/10 text-warning";
  if (grade === "D") return "bg-warning/10 text-warning";
  return "bg-error/10 text-error";
}

function ScorePage() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasAutoRun = useRef(false);

  async function runScan(targetUrl: string) {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/public/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setError("Rate limit reached: 10 URL scans per hour. Try again later.");
      } else if (!res.ok) {
        setError(data.error?.message ?? "Scan failed. Try again.");
      } else {
        setResult(data as ScoreResult);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run if ?url= param present
  useEffect(() => {
    const paramUrl = searchParams.get("url");
    if (paramUrl && !hasAutoRun.current) {
      hasAutoRun.current = true;
      setUrl(paramUrl);
      runScan(paramUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runScan(url);
  }

  function copyShareLink() {
    const shareUrl = `${window.location.origin}/score?url=${encodeURIComponent(result?.url ?? url)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Free · Instant · No account needed
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
            Check your AI app&apos;s<br />
            <span className="text-heading">security score</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            Get an instant security assessment of any web app: headers, SSL, scripts, CORS &amp; more.
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 rounded-lg border border-border px-4 py-3 text-sm shadow-sm focus:border-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-hover"
              placeholder="https://your-app.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Scanning…
                </span>
              ) : (
                "Scan"
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Scans security headers, SSL, inline scripts, CORS &amp; more. Respects rate limits: 10 scans/hour.
          </p>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-error bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score card */}
            <div className={`rounded-xl border-2 p-6 ${scoreBg(result.score)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Security Score
                  </p>
                  <p className="truncate text-sm text-muted">{result.url}</p>
                </div>
                <div className={`ml-4 flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold ${gradeColor(result.grade)}`}>
                  {result.grade}
                </div>
              </div>

              <div className="mt-4 flex items-end gap-3">
                <span className={`text-7xl font-extrabold leading-none ${scoreColor(result.score)}`}>
                  {result.score}
                </span>
                <span className="mb-2 text-2xl font-medium text-muted">/100</span>
              </div>

              {/* Score bar */}
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.score >= 80
                      ? "bg-success"
                      : result.score >= 50
                      ? "bg-warning"
                      : "bg-error/100"
                  }`}
                  style={{ width: `${result.score}%` }}
                />
              </div>

              {/* Summary */}
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="font-medium text-heading">
                  {result.findingsCount} issue{result.findingsCount !== 1 ? "s" : ""} found
                </span>
                {result.criticalCount > 0 && (
                  <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                    {result.criticalCount} critical
                  </span>
                )}
                {result.highCount > 0 && (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    {result.highCount} high
                  </span>
                )}
                {result.error && (
                  <span className="text-error">{result.error}</span>
                )}
              </div>

              <p className="mt-2 text-xs text-muted">
                Scanned at {new Date(result.scannedAt).toLocaleString()}
              </p>
            </div>

            {/* Findings */}
            {result.findings.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-heading">
                  Top issues found
                  {result.findingsCount > 5 && (
                    <span className="ml-2 text-xs font-normal text-muted">
                      (showing 5 of {result.findingsCount})
                    </span>
                  )}
                </h2>
                <div className="space-y-3">
                  {result.findings.map((f, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-4 ${SEVERITY_COLORS[f.severity] ?? "bg-surface-raised border-border text-heading"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded px-1.5 py-0.5 text-xs font-bold uppercase">
                          {f.severity}
                        </span>
                        <span className="text-sm font-medium">{f.title}</span>
                      </div>
                      <p className="mt-1 text-xs opacity-80">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LTD Upgrade CTA */}
            <div className="rounded-xl border-2 border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 overflow-hidden">
              {/* Value comparison */}
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-prussian-blue-200 dark:divide-prussian-blue-800">
                <div className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-dusty-denim-500">This free scan</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> One-time snapshot</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> 20+ security checks right now</li>
                    <li className="flex items-center gap-2"><span className="text-dusty-denim-400">✗</span> No monitoring between scans</li>
                    <li className="flex items-center gap-2"><span className="text-dusty-denim-400">✗</span> No alerts when things change</li>
                    <li className="flex items-center gap-2"><span className="text-dusty-denim-400">✗</span> No compliance reports</li>
                  </ul>
                </div>
                <div className="px-5 py-4 bg-prussian-blue-100/50 dark:bg-prussian-blue-900/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-prussian-blue-600 dark:text-prussian-blue-400">Lifetime Deal — $79 once</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-ink-black-900 dark:text-alabaster-grey-100">
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Continuous monitoring, every day</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Alerts when security posture changes</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> SSL expiry alerts 30/14/7 days out</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> Monthly compliance reports (PDF)</li>
                    <li className="flex items-center gap-2"><span className="text-success">✓</span> No recurring fees. Ever.</li>
                  </ul>
                </div>
              </div>
              {/* CTA row */}
              <div className="px-5 py-4 text-center border-t border-prussian-blue-200 dark:border-prussian-blue-800">
                <p className="text-sm font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
                  Want continuous monitoring? Get lifetime access for <span className="text-prussian-blue-600 dark:text-prussian-blue-400">$79</span>
                </p>
                <p className="mt-0.5 text-xs text-dusty-denim-500">One payment. Monitors your app every day. Alerts you before attackers find issues.</p>
                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/pricing"
                    className="rounded-lg bg-prussian-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
                  >
                    Get lifetime access for $79 →
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-sm text-dusty-denim-600 dark:text-dusty-denim-400 hover:text-prussian-blue-600"
                  >
                    Compare all plans
                  </Link>
                </div>
              </div>
            </div>

            {/* Blog education links */}
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Learn more about what we found</p>
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

            {/* Share */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <div>
                <p className="text-xs font-medium text-heading">Share this score</p>
                <p className="truncate text-xs text-muted">
                  scantient.com/score?url={encodeURIComponent(result.url)}
                </p>
              </div>
              <button
                onClick={copyShareLink}
                className="ml-4 shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-body transition hover:bg-surface-raised"
              >
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        )}

        {/* Empty state info */}
        {!result && !loading && !error && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: "🛡️", title: "Security Headers", desc: "Check for missing HSTS, CSP, X-Frame-Options and more" },
              { icon: "🔒", title: "SSL & HTTPS", desc: "Validate HTTPS enforcement and certificate issues" },
              { icon: "⚠️", title: "Inline Scripts & CORS", desc: "Detect dangerous inline scripts and CORS misconfigurations" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-surface-raised p-4 text-center">
                <div className="text-2xl">{item.icon}</div>
                <h3 className="mt-2 text-sm font-semibold text-heading">{item.title}</h3>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

    </>
  );
}

export default function ScorePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-muted">Loading…</div>}>
      <ScorePage />
    </Suspense>
  );
}
