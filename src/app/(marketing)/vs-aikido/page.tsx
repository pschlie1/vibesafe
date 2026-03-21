"use client";
import Link from "next/link";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Compare", item: "https://scantient.com" },
    { "@type": "ListItem", position: 3, name: "Aikido", item: "https://scantient.com/vs-aikido" },
  ],
};

export default function VsAikidoPage() {
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
              AIKIDO VS SCANTIENT
            </span>
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-black-950 dark:text-alabaster-grey-50 sm:text-6xl lg:text-[3.75rem] transition-colors">
            Aikido Security vs Scantient: <br />
            <span className="text-prussian-blue-600 dark:text-prussian-blue-400 transition-colors">Dev-First Security Tools Compared</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[640px] text-lg leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-500 transition-colors">
            Both tools are built for developers. But they attack the problem from opposite ends of the stack — one starts at the code, the other starts at the live app. Here&apos;s which one fits where you are.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 dark:bg-prussian-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-prussian-blue-600/25 dark:shadow-prussian-blue-500/20 transition-all hover:bg-prussian-blue-700 dark:hover:bg-prussian-blue-600 hover:shadow-xl hover:shadow-prussian-blue-700/40 dark:hover:shadow-prussian-blue-600/40 active:scale-95"
            >
              Run a free scan — 60 seconds
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
            Aikido Security has built a compelling all-in-one developer security platform. They cover static analysis (SAST), dependency scanning (SCA), container scanning, secrets detection, cloud posture (CSPM), and dynamic scanning (DAST) — all in one dashboard. If you&apos;re building a product and want one security tool that handles everything from code commit to cloud deployment, Aikido is worth looking at seriously.
          </p>
          <p>
            Scantient does one thing: it scans your deployed app externally and tells you what your API security posture looks like right now — from the outside, the same way an attacker sees it. No code access, no CI/CD integration, no cloud credentials. Just a URL.
          </p>
          <p>
            The question isn&apos;t &quot;which is better.&quot; It&apos;s &quot;which problem are you actually trying to solve today?&quot;
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
                <th className="px-6 py-4 text-left text-sm font-bold text-ink-black-950 dark:text-alabaster-grey-50">Aikido Security</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-prussian-blue-600 dark:text-prussian-blue-400">Scantient</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Primary focus", aikido: "All-in-one code-to-cloud security", scantient: "External API security posture scanning" },
                { feature: "Approach", aikido: "Shift-left (code → deploy → cloud)", scantient: "External scanning (deployed app, no code access)" },
                { feature: "Requires code access?", aikido: "Yes (GitHub/GitLab integration)", scantient: "No (URL only)" },
                { feature: "Requires cloud credentials?", aikido: "Yes (for CSPM)", scantient: "No" },
                { feature: "Setup time", aikido: "30–60 min (connect repos, cloud, CI)", scantient: "60 seconds (paste URL)" },
                { feature: "SAST (static analysis)", aikido: "Yes", scantient: "No" },
                { feature: "Dependency scanning (SCA)", aikido: "Yes", scantient: "No" },
                { feature: "Container scanning", aikido: "Yes", scantient: "No" },
                { feature: "Secrets detection", aikido: "Yes (in-code)", scantient: "Yes (exposed in deployed app)" },
                { feature: "DAST / external scanning", aikido: "Yes (part of platform)", scantient: "Primary feature" },
                { feature: "API security headers check", aikido: "Partial", scantient: "Deep (CORS, CSP, HSTS, and 20+ checks)" },
                { feature: "LTD pricing", aikido: "No (subscription only)", scantient: "Yes — $79 one-time" },
                { feature: "Starting price", aikido: "~$314/mo (Developer plan)", scantient: "$29/mo or $79 lifetime" },
                { feature: "Target audience", aikido: "Dev teams, growing startups, enterprise", scantient: "Indie devs, solo founders, small SaaS teams" },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-alabaster-grey-100 dark:border-ink-black-800">
                  <td className="px-6 py-4 text-sm font-semibold text-ink-black-900 dark:text-alabaster-grey-50">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-dusty-denim-600 dark:text-dusty-denim-500">{row.aikido}</td>
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
              <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-6">Choose Aikido when…</h3>
              <ul className="space-y-3">
                {[
                  "You want a single platform covering your full security surface — code, deps, containers, cloud",
                  "Your team has a dedicated engineering workflow and can integrate tools into CI/CD",
                  "You're scaling past 10 developers and need security visibility across multiple repos",
                  "You have cloud infrastructure (AWS, GCP, Azure) and need posture management",
                  "Your investors or enterprise customers are asking about your security program",
                  "Budget isn't a blocker and you want the most comprehensive coverage available",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
                    <span className="mt-0.5 h-5 w-5 shrink-0 text-info">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-6">Choose Scantient when…</h3>
              <ul className="space-y-3">
                {[
                  "You just deployed and want to know your security posture in the next 60 seconds",
                  "You don't want to connect a GitHub repo or cloud account — you just have a URL",
                  "You're an indie dev or solo founder and $300+/mo isn't in the budget",
                  "You want a $79 lifetime deal and zero recurring security tooling costs",
                  "You care most about what attackers see: exposed secrets, CORS, headers, open endpoints",
                  "You want fast answers, not a comprehensive security program (yet)",
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
          <h2 className="text-2xl font-bold text-ink-black-950 dark:text-alabaster-grey-50 mb-6">The honest comparison</h2>
          <div className="space-y-5 text-base leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
            <p>
              Aikido is one of the most impressive security platforms built for developers in recent memory. They&apos;ve crammed genuine security value into a developer-friendly interface, and their growth reflects that. If you&apos;re building a funded startup and have a team of developers shipping code regularly, Aikido is worth serious evaluation.
            </p>
            <p>
              But Aikido requires you to give it access to your code repositories and cloud accounts. That&apos;s a meaningful ask — especially for early-stage founders, freelancers building client projects, or anyone who wants to audit a deployed app quickly without setting up an entire security program first.
            </p>
            <p>
              Scantient is more like a zero-friction security check. You get an external view of your app — the same one attackers get — without installing anything, connecting any account, or spending more than 60 seconds. For an indie dev who just pushed to Vercel and wants to know if they missed anything obvious before tweeting their launch, that&apos;s not a consolation prize. It&apos;s the right tool.
            </p>
            <p>
              There&apos;s also a strong &quot;both&quot; case here. Use Scantient for fast external spot-checks after every deploy. Use Aikido if and when you need comprehensive code-to-cloud coverage. They don&apos;t compete on the same dimension — one is a reconnaissance tool, the other is a full security program.
            </p>
            <p>
              Start with the free scan. <Link href="/score" className="text-prussian-blue-600 hover:underline">Run it right now</Link> — no account, no setup, 60 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-alabaster-grey-200 dark:border-ink-black-800 px-6 py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50">
            See your external security score — free
          </h2>
          <p className="mt-4 text-base text-dusty-denim-700 dark:text-dusty-denim-400">
            Paste your URL. Get your security posture in 60 seconds. No GitHub access required.
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
              Get lifetime access — $79
            </Link>
          </div>
          <p className="mt-6 text-xs text-dusty-denim-500">
            Also compare: <Link href="/vs-snyk" className="text-prussian-blue-600 hover:underline">Scantient vs Snyk</Link> ·{" "}
            <Link href="/vs-hostedscan" className="text-prussian-blue-600 hover:underline">Scantient vs HostedScan</Link> ·{" "}
            <Link href="/vs-gitguardian" className="text-prussian-blue-600 hover:underline">Scantient vs GitGuardian</Link>
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
