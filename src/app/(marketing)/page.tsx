"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Check = {
  icon: string;
  title: string;
  outcome?: string;
  desc: string;
};

const checks: Check[] = [
  { icon: "🔑", title: "Exposed API Keys", outcome: "Your outcome: Stop stolen credentials.", desc: "We found $50K in exposed Stripe keys in 30 seconds. Scans OpenAI, Stripe, Supabase, Twilio, SendGrid, AWS keys, and 20+ other services." },
  { icon: "🛡️", title: "Missing Security Headers", outcome: "Your outcome: Protect users from XSS, clickjacking, injection attacks.", desc: "One missing header exposes your data to attackers. We verify CSP, HSTS, X-Frame-Options, X-Content-Type, Referrer-Policy." },
  { icon: "🔓", title: "Auth Bypass Vulnerabilities", outcome: "Your outcome: No $500K breach from a check role on frontend mistake.", desc: "We detect hardcoded admin checks, fake auth gates, and role checks visible in client code." },
  { icon: "📦", title: "Hardcoded Secrets in JavaScript", outcome: "Your outcome: Database passwords not in your JavaScript bundle.", desc: "Scantient finds secrets hardcoded in JS chunks, config files, git history, and comments. A common mistake when using AI coding tools." },
  { icon: "⚙️", title: "Exposed Debug Endpoints", outcome: "Your outcome: Attackers don't find .env, .git/HEAD, /api/admin, phpinfo.", desc: "Attackers check for debug endpoints within 2 minutes of finding your site. We check first." },
  { icon: "🚀", title: "Performance and Uptime Alerts", outcome: "Your outcome: Know about outages before your CEO calls.", desc: "We baseline your response time and alert if load time jumps to 8 seconds. Get notified of 500 errors within hours, before customers report them." },
  { icon: "🔗", title: "Malicious External Scripts", outcome: "Your outcome: No backdoors from compromised CDNs.", desc: "Every third-party script is a potential breach. We detect unencrypted loads, suspicious data URIs, and supply chain compromises." },
  { icon: "📋", title: "Form and API Security Flaws", outcome: "Your outcome: Forms submit to YOUR domain, not attacker's.", desc: "We catch forms submitting to wrong domains, missing CSRF tokens, and unencrypted API calls. The stuff compliance auditors find." },
  { icon: "🌐", title: "CORS and API Exposure Issues", outcome: "Your outcome: Competitors are blocked from reading your customer data via API.", desc: "One misconfigured CORS header = your API exposed. We detect overpermissive access." },
  { icon: "🔐", title: "SSL Certificate Expiry", outcome: "Your outcome: Your site never goes dark due to expired SSL.", desc: "A lapsed certificate = 100% downtime. We alert 30, 14, and 7 days before expiry." },
  { icon: "📡", title: "Subdomain Takeover Risks", outcome: "Your outcome: Forgotten DNS records aren't free subdomains for attackers.", desc: "We detect DNS misconfigurations, orphaned CNAME records, and unused subdomains." },
  { icon: "⏱️", title: "Load Time Regression Detection", outcome: "Your outcome: Catch performance degradation before users bounce.", desc: "Baseline your app's speed. If it suddenly takes 8 seconds to load, you know before your users do." },
  { icon: "🍪", title: "Cookie Security Issues", outcome: "Your outcome: Session cookies protected from theft and XSS.", desc: "We verify HttpOnly, Secure, SameSite flags on all cookies." },
  { icon: "🔄", title: "Content Change Detection", outcome: "Your outcome: Know when your site's HTML changed unexpectedly.", desc: "Baseline your app. If an attacker injects content or modifiers change things, we alert you." },
  { icon: "🛡️", title: "Dependency Vulnerability Scanning", outcome: "Your outcome: No known vulnerable libraries in your app.", desc: "We scan package.json, npm/yarn lock files for outdated and vulnerable dependencies." },
  { icon: "📊", title: "Unencrypted Data Transmission", outcome: "Your outcome: All data in transit is encrypted (HTTPS).", desc: "We verify no HTTP resources are mixed with HTTPS." },
  { icon: "🤖", title: "Bot Detection and Abuse Protection", outcome: "Your outcome: Know if your APIs are being scraped or abused.", desc: "We detect unusual request patterns that indicate bot activity." },
  { icon: "🎯", title: "Pixel Tracking and Privacy Violations", outcome: "Your outcome: Track all third-party pixels and analytics tools.", desc: "Know which tracking tools are on your site, ensure GDPR/privacy compliance." },
  { icon: "🔧", title: "Infrastructure Misconfiguration", outcome: "Your outcome: S3 buckets, databases, storage not open to the internet.", desc: "We detect public S3 buckets, exposed database ports, and cloud storage misconfigurations." },
  { icon: "📱", title: "Mobile and Responsive Security", outcome: "Your outcome: Your app is secure on mobile, tablet, and desktop.", desc: "We scan security across all device breakpoints." },
];

const socialProof = [
  {
    icon: "🛡️",
    stat: "$50K+",
    label: "In leaked credentials found",
    detail: "Real founding story: We found $50K in stolen API keys before the attacker used them.",
    href: "#features",
  },
  {
    icon: "⚡",
    stat: "<60 sec",
    label: "From URL to security audit",
    detail: "Paste your site URL and get results faster than you make coffee. No waiting, no setup.",
    href: "/score",
  },
  {
    icon: "🔐",
    stat: "20",
    label: "Security checks every scan",
    detail: "API keys, exposed admin panels, broken auth, SSL certs, performance, bot detection, and more. Every single time. Automated.",
    href: "#features",
  },
];

const integrations = {
  live: [
    { name: "Jira", logo: "/logos/jira.svg" },
    { name: "GitHub", logo: "/logos/github.svg" },
    { name: "Microsoft Teams", logo: "/logos/teams.svg" },
    { name: "PagerDuty", logo: "/logos/pagerduty.svg" },
    { name: "Okta", logo: "/logos/okta.svg" },
    { name: "Azure AD", logo: "/logos/azure.svg" },
    { name: "Google Workspace", logo: "/logos/google.svg" },
    { name: "MCP", logo: "/logos/mcp.svg" },
  ],
  soon: [
    { name: "Slack", logo: "/logos/slack.svg" },
    { name: "Vercel", logo: "/logos/vercel.svg" },
    { name: "Netlify", logo: "/logos/netlify.svg" },
    { name: "Datadog", logo: "/logos/datadog.svg" },
    { name: "Linear", logo: "/logos/linear.svg" },
  ],
};

const faqs = [
  {
    q: "How does Scantient scan without an SDK?",
    a: "Scantient performs external scans using the same techniques attackers use. We analyze HTTP responses, JavaScript bundles, security headers, and public-facing configurations. No code changes or developer involvement required.",
  },
  {
    q: "What types of AI-generated apps does Scantient monitor?",
    a: "Any web application accessible via URL: built with Cursor, Lovable, Bolt, Replit, or any other AI coding tool. If the app has a URL, Scantient scans the app.",
  },
  {
    q: "How long does setup take?",
    a: "Under 2 minutes. Enter your app URLs, and Scantient starts scanning immediately. No SDK integration, no configuration files, no developer tickets.",
  },
  {
    q: "Is Scantient a replacement for penetration testing?",
    a: "No. Scantient provides continuous, automated external security monitoring: your always-on first line of defense. We recommend annual penetration testing alongside continuous monitoring.",
  },
  {
    q: "What compliance frameworks does Scantient support?",
    a: "Reports align with SOC 2, ISO 27001, and NIST CSF controls. Enterprise plans include customizable templates for auditor submission.",
  },
  {
    q: "Does Scantient test for exposed admin and debug endpoints?",
    a: "Yes. Every scan probes 15 common dangerous paths: .env files, .git/HEAD, /api/admin, /api/debug, phpinfo.php, Spring Boot actuators, and more. These are the first paths attackers check.",
  },
  {
    q: "Does Scantient monitor SSL certificate expiry?",
    a: "Yes. We verify your SSL certificate status on every scan and alert you at 30, 14, and 7 days before expiry. A lapsed certificate takes your site offline for every user.",
  },
  {
    q: "Does Scantient work on any framework or hosting platform?",
    a: "Yes. Scantient scans any public URL regardless of framework or host. Next.js on Vercel, Django on Render, Rails on Heroku, PHP on shared hosting. If it has a URL, Scantient scans it.",
  },
];

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Scantient",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", price: "79", priceCurrency: "USD", name: "Maker LTD", description: "Lifetime access" },
    { "@type": "Offer", price: "399", priceCurrency: "USD", name: "Pro", description: "Monthly" },
  ],
  description: "Security monitoring for AI-generated applications",
  url: "https://scantient.com",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Scantient",
  url: "https://scantient.com",
  logo: "https://scantient.com/logo.png",
  description: "Scantient provides automated security scanning and monitoring for AI-generated and indie developer applications, catching vulnerabilities, misconfigurations, and compliance gaps before attackers do.",
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".page-lede"] },
  "url": "https://scantient.com",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const severityBorder: Record<string, string> = {
  "🔑": "border-l-4 border-l-red-500",
  "🔓": "border-l-4 border-l-amber-500",
  "🛡️": "border-l-4 border-l-blue-500",
};
const getCardBorder = (icon: string) => severityBorder[icon] ?? "border-l-4 border-l-border";

// Animated terminal component
function TerminalDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [800, 1400, 2000, 2600, 3200, 3800, 4600];
    const timers = timings.map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/8" style={{ background: "rgba(255,255,255,0.025)" }}>
      {/* Title bar */}
      <div className="flex items-center px-5 py-3.5 border-b border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
        </div>
        <span className="text-xs text-muted mx-auto font-mono tracking-wide">scantient: api.myapp.com</span>
        {phase >= 6 && (
          <span className="text-xs font-semibold text-severity-critical animate-pulse">3 critical</span>
        )}
      </div>
      {/* Terminal body */}
      <div className="p-6 font-mono text-sm leading-7 text-left min-h-[240px]">
        <p className="text-muted">$ scantient scan https://api.myapp.com</p>
        {phase >= 1 && <p className="text-info">→ Discovering endpoints...</p>}
        {phase >= 2 && (
          <div className="my-2 h-px w-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-full absolute top-0 left-0" style={{ background: "linear-gradient(to right, transparent, var(--color-info), transparent)", width: phase >= 3 ? "100%" : "0", transition: "width 1.2s ease-out", opacity: phase >= 3 ? 0.4 : 1 }} />
          </div>
        )}
        {phase >= 3 && <p className="text-success">✓ 47 endpoints discovered <span className="text-muted ml-2">1.2s</span></p>}
        {phase >= 3 && <p className="text-success">✓ Auth headers verified <span className="text-muted ml-2">0.8s</span></p>}
        {phase >= 4 && <p className="text-warning">⚠ CORS misconfiguration <span className="text-muted ml-2">/api/users, /api/export</span></p>}
        {phase >= 5 && <p className="text-severity-critical">✗ API key in response body <span className="text-muted ml-2">sk_live_4xK9… (Stripe)</span></p>}
        {phase >= 5 && <p className="text-severity-critical">✗ No rate limiting on auth <span className="text-muted ml-2">/api/auth/login</span></p>}
        {phase >= 6 && (
          <div className="border-t mt-3 pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-heading font-semibold">
              Complete in <span className="text-success">48s</span>
              <span className="text-muted mx-2">·</span>
              Score: <span className="text-severity-critical">43/100</span>
              <span className="text-muted mx-2">·</span>
              <span className="text-severity-critical">3 critical findings</span>
            </p>
          </div>
        )}
        {phase < 6 && <p className="text-muted mt-1">$ <span className="animate-pulse text-muted">▋</span></p>}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <div>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-24 pb-20 px-6" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(59,130,246,0.13) 0%, var(--color-section-base) 70%)" }}>
          <div className="mx-auto max-w-[1200px] text-center">

            {/* Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full border px-4 py-1.5 mb-10" style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.08)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--color-info)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--color-info)" }} />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-info">New: Agentic Vulnerability Scanning</span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-[72px] mb-7"
              style={{ color: "var(--color-heading)" }}>
              Ship AI-Generated Code<br />
              <span style={{ background: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                With Zero Security Debt.
              </span>
            </h1>

            {/* Subhead */}
            <p className="mx-auto max-w-2xl text-xl leading-relaxed mb-12 page-lede" style={{ color: "var(--color-muted)" }}>
              AI coding tools ship fast and ship vulnerable. Scantient finds exposed API keys, broken auth, and missing security headers in 60 seconds. No SDK. No code access. No setup.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-5">
              <Link
                href="/score"
                className="w-full sm:w-auto rounded-xl bg-[#22C55E] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#16A34A]"
              >
                Scan My App Free
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10"
              >
                See pricing plans
              </Link>
            </div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No credit card required. Scan takes under 1 minute.
            </p>
          </div>

          {/* Terminal mockup */}
          <div className="max-w-3xl mx-auto mt-16 relative">
            <TerminalDemo />
            <div className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 h-10 w-1/2 rounded-full blur-2xl" style={{ background: "rgba(59,130,246,0.08)" }} />
          </div>

          {/* Scroll chevron */}
          <div className="mt-14 flex justify-center">
            <svg className="h-7 w-7 animate-bounce opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--color-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* ── AI TOOLS BAND ── */}
        <section className="border-y px-6 py-12" style={{ borderColor: "var(--color-stroke-subtle)", background: "var(--color-section-base)" }}>
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: "var(--color-muted)" }}>
              Built for apps shipped with
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {["Cursor", "Lovable", "Bolt", "Replit", "v0"].map((tool) => (
                <span
                  key={tool}
                  className="rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
                  style={{ borderColor: "var(--color-stroke)", color: "var(--color-muted)", background: "var(--color-surface)" }}
                >
                  {tool}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-10 sm:gap-16">
              {[
                { value: "20", label: "security checks per scan" },
                { value: "<1 min", label: "URL to first results" },
                { value: "$4.88M", label: "avg. breach cost (IBM 2024)" },
                { value: "0", label: "SDK or setup required" },
              ].map((stat) => (
                <div key={stat.value} className="text-center">
                  <p className="text-3xl font-bold" style={{ color: "var(--color-heading)" }}>{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Laser divider */}
        <div className="relative h-px w-full overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ background: "linear-gradient(to right, transparent 0%, #22C55E 50%, transparent 100%)" }} />
        </div>

        {/* ── FEATURE CARDS ── */}
        <section id="features" className="px-6 py-24 sm:py-32" style={{ background: "linear-gradient(to bottom, var(--color-hero-edge) 0%, var(--color-findings-bg) 8%, var(--color-findings-bg) 100%)" }}>
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--color-heading)" }}>
              20 Checks. Every Scan. Zero Setup.
            </h2>
            <p className="mb-16 text-center" style={{ color: "var(--color-muted)" }}>
              20 essential security checks. Every scan. Zero setup. No developer required.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {checks.map((check) => (
                <div
                  key={check.title}
                  className={`rounded-2xl border p-8 transition-all hover:shadow-lg ${getCardBorder(check.icon)}`}
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--color-surface-raised)" }}>
                    <span className="text-xl">{check.icon}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold" style={{ color: "var(--color-heading)" }}>{check.icon} {check.title}</h3>
                  {check.outcome && (
                    <p className="mt-2 text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{check.outcome}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{check.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="relative overflow-hidden px-6 py-24 sm:py-32 border-t" style={{ background: "var(--color-section-lift)", borderColor: "var(--color-stroke-subtle)" }}>
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-4 text-center text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--color-heading)" }}>
              No SDK. No setup. No developer ticket.
            </h2>
            <p className="mb-16 text-center max-w-xl mx-auto" style={{ color: "var(--color-muted)" }}>
              Paste a URL. Get results in 60 seconds. That is the entire setup process.
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { step: "01", title: "Paste your URL", desc: "Drop in your app URL. No code changes, no SDK, no developer required. Takes 10 seconds.", icon: "🔗" },
                { step: "02", title: "60-second scan", desc: "We run 20 external security checks, the same probes an attacker would run. Results appear before your coffee is ready.", icon: "⚡" },
                { step: "03", title: "Instant security report", desc: "See exactly what is exposed, what to fix, and how urgent each issue is. Share with your team or export for compliance.", icon: "📋" },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border p-8" style={{ background: "var(--color-card-bg)", borderColor: "var(--color-stroke)" }}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-success">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-heading)" }}>{item.title}</h3>
                  <p className="text-sm leading-loose" style={{ color: "var(--color-muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Laser divider */}
        <div className="relative h-px w-full overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ background: "linear-gradient(to right, transparent 0%, #22C55E 50%, transparent 100%)" }} />
        </div>

        {/* ── INTEGRATIONS ── */}
        <section className="mx-auto max-w-[1200px] px-6 py-24 text-center sm:py-32" style={{ background: "var(--color-section-base)" }}>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--color-heading)" }}>Drops into any stack in 60 seconds</h2>
          <p className="mb-12" style={{ color: "var(--color-muted)" }}>Integrates with the tools your team already uses</p>

          <div className="mb-4 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-success" style={{ background: "rgba(16,185,129,0.1)" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Live
            </span>
          </div>
          <div className="mb-14 flex flex-wrap items-center justify-center gap-6">
            {integrations.live.map((i) => (
              <div key={i.name} className="flex flex-col items-center gap-2.5">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border p-3 shadow-sm" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <Image src={i.logo} alt={i.name} width={40} height={40} unoptimized className="h-full w-full object-contain" />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{i.name}</span>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
              Coming soon
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {integrations.soon.map((i) => (
              <div key={i.name} className="flex flex-col items-center gap-2.5 opacity-40">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border p-3 shadow-sm grayscale" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <Image src={i.logo} alt={i.name} width={40} height={40} unoptimized className="h-full w-full object-contain" />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{i.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <section className="border-y px-6 py-24 sm:py-32" style={{ borderColor: "var(--color-stroke-subtle)", background: "var(--color-section-lift)" }}>
          <div className="mx-auto max-w-[1200px]">
            <h2 className="mb-4 text-center text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--color-heading)" }}>Results that speak for themselves</h2>
            <p className="mb-16 text-center" style={{ color: "var(--color-muted)" }}>We walk the walk. Scantient scans itself on every deploy. Here is what we find.</p>
            <div className="grid gap-8 md:grid-cols-3">
              {socialProof.map((item) => (
                <a
                  key={item.stat}
                  href={item.href}
                  className="group relative rounded-2xl border p-8 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <div className="mb-4 text-3xl">{item.icon}</div>
                  <p className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--color-heading)" }}>{item.stat}</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>{item.label}</p>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{item.detail}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-6 py-24 text-center sm:py-32" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.05) 0%, var(--color-section-base) 60%)" }}>
          <div className="mx-auto max-w-[600px]">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-5" style={{ color: "var(--color-heading)" }}>
              Secure your AI-built app in 60 seconds.
            </h2>
            <p className="mb-10 leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Find exposed API keys, broken auth, and security holes before attackers do. No SDK. No setup. Results in 60 seconds.
            </p>
            <Link
              href="/score"
              className="inline-block rounded-xl bg-[#22C55E] px-10 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#16A34A]"
            >
              Scan My App Free
            </Link>
            <p className="mt-4 text-sm" style={{ color: "var(--color-muted)" }}>No credit card required. Scan takes under 1 minute.</p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t px-6 py-24 sm:py-32" style={{ background: "var(--color-section-base)", borderColor: "var(--color-stroke-subtle)" }}>
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-16 text-center text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--color-heading)" }}>
              Frequently asked questions
            </h2>
            <div className="space-y-10">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="font-bold" style={{ color: "var(--color-heading)" }}>{faq.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <section className="px-6 py-24 text-center sm:py-32" style={{ background: "var(--color-section-base)" }}>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--color-heading)" }}>
            Stop finding out about breaches<br />from your CEO.
          </h2>
          <p className="mx-auto mt-6 max-w-xl" style={{ color: "var(--color-muted)" }}>
            Add your first app URL. We start scanning in 60 seconds.
          </p>
          <Link
            href="/score"
            className="mt-10 inline-block rounded-xl bg-[#22C55E] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
          >
            Scan My App Free
          </Link>
        </section>

      </div>
    </>
  );
}
