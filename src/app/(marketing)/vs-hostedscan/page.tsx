"use client";
import Link from "next/link";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Compare", item: "https://scantient.com" },
    { "@type": "ListItem", position: 3, name: "HostedScan", item: "https://scantient.com/vs-hostedscan" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How does Scantient compare to HostedScan?", "acceptedAnswer": { "@type": "Answer", "text": "HostedScan is a network and infrastructure scanner. Scantient focuses specifically on API and application security. For teams building APIs who need pre-deploy security checks, Scantient is the more focused tool." } },
    { "@type": "Question", "name": "Does Scantient do network scanning like HostedScan?", "acceptedAnswer": { "@type": "Answer", "text": "No. Scantient focuses on application-layer API security. For network-level scanning, HostedScan is designed for that use case. The two tools are complementary." } },
    { "@type": "Question", "name": "What does Scantient check that HostedScan misses?", "acceptedAnswer": { "@type": "Answer", "text": "Scantient checks API-specific issues: JWT security, authentication patterns, CORS headers, rate limiting, and secret exposure in API responses. These are application-layer checks that network scanners do not cover." } },
    { "@type": "Question", "name": "Which tool is easier to set up?", "acceptedAnswer": { "@type": "Answer", "text": "Scantient integrates directly into your CI pipeline as a GitHub Action. Setup takes under 10 minutes and it runs on every pull request automatically." } },
  ],
};

export default function VsHostedScanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="bg-alabaster-grey-50 dark:bg-ink-black-950 transition-colors">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24 sm:pb-32 sm:pt-32" style={{ background: "radial-gradient(ellipse at 50% 0%, #ebf2f9 0%, #f3f3f1 70%)" }}>
        <div className="mx-auto max-w-[1200px] text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-3 py-1 text-xs font-bold text-info border border-info/30">
              <span className="h-2 w-2 rounded-full bg-info animate-pulse" />
              HOSTEDSCAN VS SCANTIENT
            </span>
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-6xl lg:text-[3.75rem] transition-colors">
            HostedScan vs Scantient: <br />
            <span className="text-prussian-blue-600 dark:text-prussian-blue-400 transition-colors">Which External Security Scanner Fits Your Stack?</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[640px] text-lg leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-500 transition-colors">
            Both tools scan your app from the outside . no code access required. But they make very different bets on what &quot;security scanning&quot; means for indie devs and small teams.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 dark:bg-prussian-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-prussian-blue-600/25 dark:shadow-prussian-blue-500/20 transition-all hover:bg-prussian-blue-700 dark:hover:bg-prussian-blue-600 hover:shadow-xl hover:shadow-prussian-blue-700/40 dark:hover:shadow-prussian-blue-600/40 active:scale-95"
            >
              Run a free scan . 60 seconds
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-alabaster-grey-200 dark:border-ink-black-800 bg-white dark:bg-ink-black-900 px-8 py-3.5 text-sm font-semibold text-dusty-denim-700 dark:text-dusty-denim-100 transition-all hover:border-alabaster-grey-300 dark:hover:border-ink-black-700 hover:bg-alabaster-grey-50 dark:hover:bg-ink-black-800 active:scale-95"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="mx-auto max-w-3xl text-dusty-denim-700 dark:text-dusty-denim-400 space-y-6 text-base leading-relaxed">
          <p>
            HostedScan and Scantient are both external security scanners . meaning you point them at a URL, and they audit your app the way an attacker would: from the outside, without needing access to your source code, CI/CD pipeline, or internal infrastructure.
          </p>
          <p>
            That makes them genuine alternatives. But the audiences, feature sets, and pricing philosophies are quite different. Here&apos;s an honest breakdown.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <h2 className="mb-12 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">Head-to-head comparison</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-alabaster-grey-200 dark:border-ink-black-800">
                <th className="px-6 py-4 text-left text-sm font-bold text-ink-black-950 dark:text-alabaster-grey-50">Feature</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-ink-black-950 dark:text-alabaster-grey-50">HostedScan</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-prussian-blue-600 dark:text-prussian-blue-400">Scantient</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Primary focus", hostedscan: "Network, web, and API scanning (broad)", scantient: "API security posture + outcomes (focused)" },
                { feature: "Scan trigger", hostedscan: "Scheduled or manual", scantient: "URL (instant, no signup for first scan)" },
                { feature: "Setup time", hostedscan: "Minutes (account + configure targets)", scantient: "60 seconds (paste URL, get results)" },
                { feature: "What it checks", hostedscan: "Network ports, web vulnerabilities, API surface", scantient: "API keys, security headers, CORS, SSL, endpoints, CSP, rate limits" },
                { feature: "Requires agent/SDK?", hostedscan: "No (external scanning)", scantient: "No (external scanning)" },
                { feature: "Network scanning", hostedscan: "Yes (ports, services)", scantient: "No (API/web focus)" },
                { feature: "API security focus", hostedscan: "Partial", scantient: "Primary focus" },
                { feature: "LTD pricing", hostedscan: "No (subscription only)", scantient: "Yes . $79 one-time" },
                { feature: "Monthly subscription", hostedscan: "From ~$99/mo", scantient: "From $29/mo" },
                { feature: "Target audience", hostedscan: "SMBs, IT teams, compliance-focused", scantient: "Indie devs, solo founders, small SaaS teams" },
                { feature: "Compliance reporting", hostedscan: "Yes (SOC 2, OWASP, PCI reports)", scantient: "Monthly PDF reports" },
                { feature: "Free tier", hostedscan: "Free trial (limited)", scantient: "Free scan (no signup required)" },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-alabaster-grey-100 dark:border-ink-black-800">
                  <td className="px-6 py-4 text-sm font-semibold text-ink-black-900 dark:text-alabaster-grey-50">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-dusty-denim-600 dark:text-dusty-denim-500">{row.hostedscan}</td>
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
          <h2 className="mb-16 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">When to choose each</h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-6">HostedScan is better when…</h3>
              <ul className="space-y-3">
                {[
                  "You need to audit the full network perimeter . not just your web app",
                  "Your team is compliance-driven and needs formal reports (SOC 2, PCI DSS)",
                  "You're managing multiple targets across clients (MSP use case)",
                  "You want scheduled, recurring scans with detailed issue tracking",
                  "Your ICP is enterprise IT or security teams with dedicated tooling budgets",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
                    <span className="mt-0.5 h-5 w-5 shrink-0 text-info">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-6">Scantient is better when…</h3>
              <ul className="space-y-3">
                {[
                  "You're an indie dev or solo founder who needs answers in 60 seconds, not a setup process",
                  "You care most about API security: exposed keys, CORS misconfig, missing headers",
                  "You want to pay once ($79 LTD) and stop paying monthly forever",
                  "You're pre-revenue or early-stage and every dollar counts",
                  "You want a fast, scannable security score before launch day . not a full audit engagement",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
                    <span className="mt-0.5 h-5 w-5 shrink-0 text-success">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Honest take */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-6">The honest take</h2>
          <div className="space-y-5 text-base leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
            <p>
              HostedScan is a mature product. They&apos;ve been around longer, they cover more scanning categories (network scanning is genuinely useful for SMBs with on-prem infrastructure), and their compliance reporting is solid for teams that need it.
            </p>
            <p>
              But HostedScan&apos;s pricing and feature depth is calibrated for IT teams and small businesses with recurring security budgets. If you&apos;re a developer who just deployed a Next.js app and wants to know if your API is leaking secrets or missing CSP headers . HostedScan is more tool than you need, and you&apos;ll pay for it accordingly.
            </p>
            <p>
              Scantient trades breadth for speed and focus. No network port scanning. No SBOM. No enterprise compliance workflows. What you get instead: the fastest path from &quot;I just deployed&quot; to &quot;I know my API security posture&quot; . and a lifetime deal that means you never pay again.
            </p>
            <p>
              For most indie devs, that trade-off is obvious. For IT directors managing a hybrid network with 20 services? HostedScan probably wins. The good news: you don&apos;t have to pick one forever. Run a{" "}
              <Link href="/score" className="text-prussian-blue-600 hover:underline">free Scantient scan</Link> in 60 seconds and see what it finds before committing to anything.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing comparison */}
      <section className="border-t border-alabaster-grey-200 dark:border-ink-black-800 bg-white dark:bg-ink-black-900 px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-12 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">Pricing comparison</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-alabaster-grey-200 dark:border-ink-black-800 p-8">
              <h3 className="text-lg font-bold text-ink-black-950 dark:text-alabaster-grey-50">HostedScan</h3>
              <p className="mt-2 text-sm text-dusty-denim-600 dark:text-dusty-denim-500">Subscription model</p>
              <div className="mt-6 space-y-3 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
                <div className="flex justify-between"><span>Starter</span><span className="font-semibold">~$99/mo</span></div>
                <div className="flex justify-between"><span>Business</span><span className="font-semibold">~$299/mo</span></div>
                <div className="flex justify-between"><span>Enterprise</span><span className="font-semibold">Custom</span></div>
                <div className="flex justify-between"><span>Lifetime deal</span><span className="font-semibold text-error">Not available</span></div>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-prussian-blue-500 dark:border-prussian-blue-400 p-8">
              <h3 className="text-lg font-bold text-ink-black-950 dark:text-alabaster-grey-50">Scantient</h3>
              <p className="mt-2 text-sm text-dusty-denim-600 dark:text-dusty-denim-500">Pay once or subscribe</p>
              <div className="mt-6 space-y-3 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
                <div className="flex justify-between"><span>Starter</span><span className="font-semibold">$29/mo</span></div>
                <div className="flex justify-between"><span>Pro</span><span className="font-semibold">$79/mo</span></div>
                <div className="flex justify-between"><span>Lifetime Deal</span><span className="font-semibold text-success">$79 one-time ✓</span></div>
                <div className="flex justify-between"><span>Free scan</span><span className="font-semibold text-success">No signup ✓</span></div>
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-dusty-denim-500">
            See full details at <Link href="/pricing" className="text-prussian-blue-600 hover:underline">scantient.com/pricing</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50">
            See your API security score in 60 seconds
          </h2>
          <p className="mt-4 text-base text-dusty-denim-700 dark:text-dusty-denim-400">
            No account required. No SDK. No setup. Paste your URL and get an instant external security scan . the same checks attackers run on your app.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 dark:bg-prussian-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-prussian-blue-600/25 transition-all hover:bg-prussian-blue-700 hover:shadow-xl active:scale-95"
            >
              Run a free scan →
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-alabaster-grey-200 dark:border-ink-black-800 bg-white dark:bg-ink-black-900 px-8 py-3.5 text-sm font-semibold text-dusty-denim-700 dark:text-dusty-denim-100 transition-all hover:bg-alabaster-grey-50 active:scale-95"
            >
              Get lifetime access . $79
            </Link>
          </div>
          <p className="mt-6 text-xs text-dusty-denim-500">
            Also see: <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">7 API security mistakes killing your startup</Link> ·{" "}
            <Link href="/blog/indie-dev-security-checklist" className="text-prussian-blue-600 hover:underline">Indie dev security checklist</Link>
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
