"use client";
import Link from "next/link";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Compare", item: "https://scantient.com" },
    { "@type": "ListItem", position: 3, name: "GitGuardian", item: "https://scantient.com/vs-gitguardian" },
  ],
};

export default function VsGitGuardianPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="bg-alabaster-grey-50 dark:bg-ink-black-950 transition-colors">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24 sm:pb-32 sm:pt-32" style={{ background: "radial-gradient(ellipse at 50% 0%, #ebf2f9 0%, #f3f3f1 70%)" }}>
        <div className="mx-auto max-w-[1200px] text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-3 py-1 text-xs font-bold text-info border border-info/30">
              <span className="h-2 w-2 rounded-full bg-info animate-pulse" />
              SCANTIENT VS GITGUARDIAN
            </span>
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-6xl lg:text-[3.75rem] transition-colors">
            Scan your live app for security issues. <br />
            <span className="text-prussian-blue-600 dark:text-prussian-blue-400 transition-colors">No code integration needed.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[600px] text-lg leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-500 transition-colors">
            GitGuardian finds secrets in your code repository. Scantient finds secrets exposed in your deployed app. Both prevent data breaches using different approaches.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup?plan=ltd"
              className="rounded-lg bg-prussian-blue-600 dark:bg-prussian-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-prussian-blue-600/25 dark:shadow-prussian-blue-500/20 transition-all hover:bg-prussian-blue-700 dark:hover:bg-prussian-blue-600 hover:shadow-xl hover:shadow-prussian-blue-700/40 dark:hover:shadow-prussian-blue-600/40 active:scale-95"
            >
              Get Scantient for $79
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-alabaster-grey-200 dark:border-ink-black-800 bg-white dark:bg-ink-black-900 px-8 py-3.5 text-sm font-semibold text-dusty-denim-700 dark:text-dusty-denim-100 transition-all hover:border-alabaster-grey-300 dark:hover:border-ink-black-700 hover:bg-alabaster-grey-50 dark:hover:bg-ink-black-800 active:scale-95"
            >
              Back to landing
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
        <h2 className="mb-16 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">Head-to-head comparison</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-alabaster-grey-200 dark:border-ink-black-800">
                <th className="px-6 py-4 text-left text-sm font-bold text-ink-black-950 dark:text-alabaster-grey-50">Feature</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-ink-black-950 dark:text-alabaster-grey-50">GitGuardian</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-prussian-blue-600 dark:text-prussian-blue-400">Scantient</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Price", gitguardian: "$499/mo (enterprise)", scantient: "$79 lifetime" },
                { feature: "Target user", gitguardian: "DevOps/InfoSec in large orgs", scantient: "Solo devs, startup CTOs" },
                { feature: "Scan trigger", gitguardian: "Git push (repo scanning)", scantient: "URL paste (external scan)" },
                { feature: "Speed", gitguardian: "Minutes (depends on repo size)", scantient: "60 seconds (no code needed)" },
                { feature: "SDK/Setup", gitguardian: "Yes (GitHub integration)", scantient: "No (URL paste, instant)" },
                { feature: "Scope", gitguardian: "Secrets in git history", scantient: "20+ checks (secrets, headers, endpoints, perf, etc.)" },
                { feature: "Compliance reports", gitguardian: "Custom (high-touch sales)", scantient: "Built-in (PDF monthly)" },
                { feature: "Setup time", gitguardian: "Days (CI/CD integration)", scantient: "2 minutes" },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-alabaster-grey-100 dark:border-ink-black-800">
                  <td className="px-6 py-4 text-sm font-semibold text-ink-black-900 dark:text-alabaster-grey-50">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-dusty-denim-600 dark:text-dusty-denim-500">{row.gitguardian}</td>
                  <td className="px-6 py-4 text-sm text-dusty-denim-600 dark:text-dusty-denim-500 font-semibold">{row.scantient}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* When to choose */}
      <section className="border-y border-alabaster-grey-200 dark:border-ink-black-800 bg-white dark:bg-ink-black-900 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-6">When GitGuardian is better</h3>
              <ul className="space-y-3">
                {[
                  "You're a 100+ person company with DevOps/InfoSec",
                  "You need historical git repository scanning",
                  "You want secrets scanning built into CI/CD pipeline",
                  "You have enterprise budget for seat-based pricing",
                  "You need deep integration with GitHub/GitHub Enterprise",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-dusty-denim-700 dark:text-dusty-denim-500">
                    <span className="text-prussian-blue-600 dark:text-prussian-blue-400 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-prussian-blue-600 dark:text-prussian-blue-400 mb-6">When Scantient is better</h3>
              <ul className="space-y-3">
                {[
                  "You're shipping fast, need quick security checks",
                  "You want external security (not just code scanning)",
                  "You need one tool covering 20+ security checks",
                  "You want compliance reports without additional cost",
                  "You're a maker or team lead, not enterprise",
                  "You want zero-friction security on a budget",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-dusty-denim-700 dark:text-dusty-denim-500">
                    <span className="text-prussian-blue-600 dark:text-prussian-blue-400 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Real Example */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
        <h2 className="mb-12 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">Real scenario: You just shipped a web app</h2>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-alabaster-grey-200 dark:border-ink-black-800 bg-white dark:bg-ink-black-900 p-8">
            <h3 className="text-lg font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-4">GitGuardian finds:</h3>
            <ul className="space-y-2">
              {[
                "✓ Leaked Stripe key from git history (rotated 6 months ago)",
                "The key remains visible in repo history even after rotation.",
              ].map((item) => (
                <li key={item} className="text-sm text-dusty-denim-700 dark:text-dusty-denim-500">{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-dusty-denim-500 dark:text-dusty-denim-600">Setup: 30 min (CI/CD integration). Time to results: 5 minutes.</p>
          </div>

          <div className="rounded-2xl border-2 border-prussian-blue-600 dark:border-prussian-blue-400 bg-white dark:bg-ink-black-900 p-8">
            <h3 className="text-lg font-bold text-prussian-blue-600 dark:text-prussian-blue-400 mb-4">Scantient finds:</h3>
            <ul className="space-y-2">
              {[
                "✓ Exposed Stripe key in JavaScript bundle (LIVE)",
                "✓ Missing CSP header allowing inline scripts",
                "✓ Performance regression from 2s to 5s load time",
                "✓ SSL cert expiring in 7 days",
              ].map((item) => (
                <li key={item} className="text-sm text-dusty-denim-700 dark:text-dusty-denim-500">{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-prussian-blue-600 dark:text-prussian-blue-400 font-semibold">Setup: 2 min (paste URL). Time to results: 60 seconds.</p>
          </div>
        </div>

        <p className="mt-8 text-center text-dusty-denim-700 dark:text-dusty-denim-500 max-w-2xl mx-auto">
          GitGuardian found the leaked key. Scantient found 3 other critical issues in 60 seconds without requiring code changes.
        </p>
      </section>

      {/* From the Blog */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 sm:py-24">
        <h2 className="text-2xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-8">From the Blog</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/blog/gitguardian-vs-scantient" className="group block rounded-xl border border-border p-6 transition hover:bg-surface-raised">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">Comparison</span>
            <p className="mt-2 text-sm font-semibold text-heading group-hover:text-heading leading-snug">GitGuardian vs Scantient: Deep Dive</p>
            <p className="mt-1 text-xs text-muted">Secrets detection vs full security posture →</p>
          </Link>
          <Link href="/blog/indie-dev-security-checklist" className="group block rounded-xl border border-border p-6 transition hover:bg-surface-raised">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">Checklist</span>
            <p className="mt-2 text-sm font-semibold text-heading group-hover:text-heading leading-snug">The Indie Dev Security Checklist</p>
            <p className="mt-1 text-xs text-muted">12 items to check before you ship →</p>
          </Link>
          <Link href="/blog/7-api-security-mistakes" className="group block rounded-xl border border-border p-6 transition hover:bg-surface-raised">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">Security</span>
            <p className="mt-2 text-sm font-semibold text-heading group-hover:text-heading leading-snug">7 API Security Mistakes Killing Your Startup</p>
            <p className="mt-1 text-xs text-muted">What external scanning catches →</p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-black-950 dark:bg-ink-black-900 px-6 py-24 text-center sm:py-32">
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">Ready to scan like a maker?</h2>
        <p className="mx-auto mt-6 max-w-xl text-alabaster-grey-200">
          Claim your $79 lifetime deal. One scan. 60 seconds. Zero doubt.
        </p>
        <Link
          href="/signup?plan=ltd"
          className="mt-10 inline-block rounded-lg bg-white dark:bg-prussian-blue-600 px-8 py-3.5 text-sm font-semibold text-ink-black-950 dark:text-white transition-all hover:bg-alabaster-grey-100 dark:hover:bg-prussian-blue-700 hover:shadow-lg active:scale-95"
        >
          Get started for $79
        </Link>
      </section>

    </div>
    </>
  );
}
