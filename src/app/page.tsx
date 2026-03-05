"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer";

type Tier = {
  name: string;
  price: string;
  period?: string;
  annualPrice?: string;
  annualSavings?: string;
  desc: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
};

const checks = [
  { icon: "🔑", title: "Exposed API Keys", desc: "Detects leaked credentials from OpenAI, Stripe, Supabase, and 10+ other services in your JavaScript. Real example: Found $50K in stolen API tokens before they were used." },
  { icon: "🛡️", title: "Missing Security Headers", desc: "Checks for CSP, HSTS, X-Frame-Options, and more. One missing header is the difference between 'safe from clickjacking' and 'data stolen from your users.'" },
  { icon: "🔓", title: "Auth Bypass Patterns", desc: "Catches fake client-side auth gates and hardcoded admin checks. Prevents the 'just check if role == admin on the frontend' trap that costs companies hundreds of thousands in breaches." },
  { icon: "📜", title: "Malicious Inline Scripts", desc: "Finds secrets hardcoded in <script> tags and dangerouslySetInnerHTML usage. Stops the issue that crashes when Cursor generates code without careful review." },
  { icon: "⚙️", title: "Exposed Source Maps & Config", desc: "Source maps reveal your entire codebase to attackers. We find .env leaks, git directories, and version disclosure that makes you an easy target." },
  { icon: "📊", title: "Uptime & Availability Tracking", desc: "Monitors response time and 500 errors across scans. Know your app is down in 4 hours, not when your CEO tells you on Monday." },
  { icon: "🔗", title: "Malicious External Scripts", desc: "Every script tag on your page is a liability. We detect compromised CDNs, HTTP (unencrypted) script loads, and data URIs that could execute attack code." },
  { icon: "📋", title: "Form & API Submission Flaws", desc: "Catches forms submitting to the wrong domain, missing CSRF tokens, and GET-method API calls. Stops the data leakage that compliance auditors love to find." },
  { icon: "🔍", title: "Broken Links & Dead Redirects", desc: "Finds 404 errors and redirect chains that degrade user trust and SEO. 404 pages aren't just annoying—they cost conversions." },
  { icon: "⚡", title: "Performance Regression Detection", desc: "Compares each scan to your baseline. If your app suddenly takes 8 seconds to load, we alert you before users abandon it." },
  { icon: "🚪", title: "Exposed Admin & Debug Endpoints", desc: "Probes for .env, .git/HEAD, /api/admin, phpinfo, and 10+ other paths attackers check first. We find them before they do." },
  { icon: "📦", title: "Outdated Dependency Warnings", desc: "Old libraries = known CVEs = easy targets. We detect jQuery, React, and npm packages shipping security bugs so you can patch them." },
  { icon: "🔐", title: "SSL Certificate Expiry Alerts", desc: "A lapsed certificate takes your site offline instantly. We remind you at 30, 14, and 7 days before expiry." },
  { icon: "🌐", title: "CORS Misconfiguration", desc: "Detects CORS headers that expose your API to anyone. Real example: One misconfigured header leaked customer PII to competitors' analytics." },
  { icon: "🎯", title: "Endpoint Enumeration", desc: "Maps every public endpoint your app exposes. You can't defend what you don't know exists." },
  { icon: "🚨", title: "Security Header Strength Scoring", desc: "Not just 'header present'—we score the strength of each header. Strong CSP blocks inline scripts. Weak CSP doesn't." },
  { icon: "🔄", title: "Content Change Detection", desc: "Alerts when homepage copy, pricing, or critical UI changes unexpectedly. Catches compromised assets before customers see malware." },
  { icon: "⏱️", title: "Response Time Tracking", desc: "Baseline your app's normal response time. Slow responses indicate DDoS, database issues, or compromised infrastructure." },
  { icon: "📡", title: "DNS & Domain Configuration", desc: "Checks for DNS misconfigurations, subdomain takeovers, and domain expiry. One forgotten DNS record is a free subdomain for attackers." },
  { icon: "🛡️", title: "Cookie & Session Security", desc: "Verifies HttpOnly, Secure, and SameSite flags on all cookies. Missing flags = XSS or CSRF attacks." },
];

const tiers = [
  {
    name: "Builder",
    price: "$49",
    period: "/month",
    annualPrice: "$490",
    annualSavings: "save $98",
    desc: "For first-time builders and startups shipping their first app",
    features: [
      "1 monitored app",
      "1 team member",
      "Daily scan intervals",
      "20 security checks",
      "Exposed API key detection",
      "Security header analysis",
      "Email alerts",
      "Security score dashboard",
    ],
    cta: "Get started",
    ctaHref: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$399",
    period: "/month",
    annualPrice: "$4,188",
    annualSavings: "save $588",
    desc: "For IT teams managing a growing AI-built app portfolio",
    features: [
      "15 monitored apps",
      "10 team members",
      "4-hour scan intervals",
      "All 20 security checks",
      "Jira integration",
      "Third-party script risk scoring",
      "Performance regression alerts",
      "Content change detection",
      "Slack & webhook alerts",
      "PDF compliance reports",
      "Compliance evidence packs",
      "API access",
    ],
    cta: "Get started",
    ctaHref: "/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$2,500",
    period: "/month",
    annualPrice: "Custom",
    annualSavings: "20% annual discount",
    desc: "For organizations with compliance and governance requirements",
    features: [
      "Unlimited apps",
      "Unlimited team members",
      "1-hour scan intervals",
      "All 20 security checks",
      "SSO / SAML / LDAP",
      "Dedicated support & 99.9% SLA",
      "Full audit logs",
      "SOC 2, ISO 27001, NIST CSF reports",
      "Executive board reports",
      "All alert channels",
      "API access",
      "Custom integrations",
    ],
    cta: "Talk to sales",
    ctaHref: "mailto:sales@scantient.com",
    highlighted: false,
  },
];

const socialProof = [
  {
    icon: "🛡️",
    stat: "96 / A",
    label: "Scantient's own security score",
    detail: "We scan ourselves on every deploy. Zero critical findings. See our live score →",
    href: "/score/scantient.com",
  },
  {
    icon: "⚡",
    stat: "2 min",
    label: "From signup to first scan",
    detail: "Paste a URL. We scan it. No SDK, no code changes, no developer ticket required.",
    href: "/score",
  },
  {
    icon: "🔍",
    stat: "20+",
    label: "Security checks every scan",
    detail: "API key leaks, missing headers, auth bypass patterns, exposed endpoints and more — automatically.",
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
    a: "Scantient performs external scans the same way an attacker would probe your applications. We analyze HTTP responses, JavaScript bundles, security headers, and public-facing configurations. No code changes or developer involvement required.",
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
    a: "Our reports map to SOC 2, ISO 27001, and NIST CSF controls. Enterprise plans include customizable compliance report templates for auditor-ready documentation.",
  },
  {
    q: "Does Scantient test for exposed admin and debug endpoints?",
    a: "Yes. Every scan probes 15 common dangerous paths: .env files, .git/HEAD, /api/admin, /api/debug, phpinfo.php, Spring Boot actuators, and more. These are the first paths attackers check. Scantient checks them first.",
  },
  {
    q: "Does Scantient monitor SSL certificate expiry?",
    a: "Yes. Scantient checks your SSL certificate on every scan and alerts you at 30, 14, and 7 days before expiry. A lapsed certificate takes your site offline for every user.",
  },
  {
    q: "How quickly can I get started?",
    a: "Under 2 minutes. Choose a plan, add your app URL, and Scantient starts scanning immediately. No SDK integration, no configuration files, no developer tickets.",
  },
];

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Scantient",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "199",
    priceCurrency: "USD",
  },
  description: "Security monitoring for AI-generated applications",
  url: "https://scantient.com",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

function PricingSection({ tiers }: { tiers: Tier[] }) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
      <h2 className="mb-3 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 sm:text-4xl">Simple, transparent pricing</h2>
      <p className="mb-8 text-center text-dusty-denim-600">
        One exposed API key costs up to $4.88M to remediate (IBM Cost of a Data Breach 2024). Scantient catches the exposure in your first scan.
      </p>

      {/* Monthly/Annual Toggle */}
      <div className="mb-12 flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!isAnnual ? "text-ink-black-950" : "text-dusty-denim-600"}`}>Monthly</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            isAnnual ? "bg-prussian-blue-600" : "bg-alabaster-grey-200"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isAnnual ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? "text-ink-black-950" : "text-dusty-denim-600"}`}>Annual</span>
        {isAnnual && <span className="ml-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Save up to 20%</span>}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl p-8 transition-transform duration-200 hover:-translate-y-1 ${
              tier.highlighted
                ? "bg-ink-black-950 text-white shadow-2xl"
                : "border border-alabaster-grey-200 bg-white"
            }`}
            style={!tier.highlighted ? { boxShadow: "0 1px 3px rgba(12,25,39,0.05)" } : undefined}
          >
            {tier.highlighted && (
              <span className="mb-4 inline-block rounded-full bg-prussian-blue-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h3 className={`text-lg font-bold ${tier.highlighted ? "text-white" : "text-ink-black-950"}`}>{tier.name}</h3>
            <div className="mt-3">
              <span className={`text-4xl font-extrabold tracking-tight ${tier.highlighted ? "text-white" : "text-ink-black-950"}`}>
                {isAnnual ? tier.annualPrice : tier.price}
              </span>
              {!isAnnual && <span className={tier.highlighted ? "text-alabaster-grey-200" : "text-dusty-denim-600"}>/month</span>}
              {isAnnual && tier.annualSavings && (
                <div className={`text-xs font-semibold ${tier.highlighted ? "text-emerald-300" : "text-emerald-600"}`}>
                  {tier.annualSavings}
                </div>
              )}
            </div>
            <p className={`mt-3 text-sm ${tier.highlighted ? "text-alabaster-grey-200" : "text-dusty-denim-600"}`}>{tier.desc}</p>
            <Link
              href={tier.ctaHref}
              className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                tier.highlighted
                  ? "bg-prussian-blue-600 text-white hover:bg-prussian-blue-700"
                  : "border border-alabaster-grey-200 text-dusty-denim-700 hover:bg-alabaster-grey-50"
              }`}
            >
              {tier.cta}
            </Link>
            <ul className="mt-8 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className={`flex items-start gap-2 text-sm ${tier.highlighted ? "text-alabaster-grey-100" : "text-dusty-denim-600"}`}>
                  <span className={`mt-0.5 ${tier.highlighted ? "text-prussian-blue-300" : "text-prussian-blue-600"}`}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    <div className="bg-alabaster-grey-50">
      {/* Nav - Frosted glass sticky header */}
      <nav className="sticky top-0 z-50 border-b border-alabaster-grey-200/60" style={{ background: "rgba(243,243,241,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-black-900">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="font-bold tracking-tight text-ink-black-900">Scantient</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/security-checklist" className="hidden text-sm font-medium text-dusty-denim-700 transition-colors hover:text-ink-black-950 sm:block">Resources</Link>
            <Link href="/#pricing" className="hidden text-sm font-medium text-dusty-denim-700 transition-colors hover:text-ink-black-950 sm:block">Pricing</Link>
            <Link href="/login" className="text-sm font-medium text-dusty-denim-700 transition-colors hover:text-ink-black-950">Sign in</Link>
            <Link
              href="/signup"
              className="rounded-full bg-prussian-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-prussian-blue-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24 sm:pb-32 sm:pt-32" style={{ background: "radial-gradient(ellipse at 50% 0%, #ebf2f9 0%, #f3f3f1 70%)" }}>
        <div className="mx-auto max-w-[1200px] text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-black-950 sm:text-6xl lg:text-[3.75rem]">
            Find security holes before
            <br />
            <span className="text-prussian-blue-600">your CEO finds out from the news.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[600px] text-lg leading-relaxed text-dusty-denim-700">
            Built your app with Cursor or Bolt? Scantient finds leaked API keys, missing security headers, and exposed endpoints in minutes. No code changes. No SDK. Works on any web app.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-prussian-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-prussian-blue-600/25 transition-all hover:bg-prussian-blue-700 hover:shadow-xl hover:shadow-prussian-blue-700/25"
            >
              Get started
            </Link>
            <Link
              href="#pricing"
              className="rounded-lg border border-alabaster-grey-200 bg-white px-8 py-3.5 text-sm font-semibold text-dusty-denim-700 transition-colors hover:border-alabaster-grey-200 hover:bg-alabaster-grey-50"
            >
              View pricing
            </Link>
          </div>
          <p className="mt-5 text-xs text-dusty-denim-600">Setup in 2 minutes · SOC 2 aligned</p>
        </div>

        {/* Dashboard mockup frame */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-xl border border-alabaster-grey-200 shadow-2xl p-2">
            <div className="aspect-video bg-ink-black-50 rounded-lg overflow-hidden relative">
              {/* Top bar */}
              <div className="bg-white border-b border-alabaster-grey-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-ink-black-200" />
                  <div className="h-2 w-2 rounded-full bg-ink-black-200" />
                  <div className="h-2 w-2 rounded-full bg-ink-black-200" />
                </div>
                <span className="text-xs font-semibold text-ink-black-400">Scantient Dashboard</span>
                <div className="h-4 w-16 rounded bg-ink-black-100" />
              </div>
              {/* Stat cards row */}
              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  { label: "Apps Monitored", value: "12" },
                  { label: "Open Findings", value: "4" },
                  { label: "Last Scan", value: "2m ago" },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-lg border border-alabaster-grey-200 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-ink-black-400">{card.label}</p>
                    <p className="mt-1 text-lg font-bold text-ink-black-800">{card.value}</p>
                    <div className="mt-2 h-1 w-8 rounded-full bg-prussian-blue-600 opacity-60" />
                  </div>
                ))}
              </div>
              {/* Table placeholder */}
              <div className="mx-4 bg-white rounded-lg border border-alabaster-grey-200 overflow-hidden">
                <div className="bg-ink-black-100 px-4 py-2 grid grid-cols-4 gap-4">
                  {["App", "Status", "Last Scan", "Findings"].map((h) => (
                    <div key={h} className="h-2 rounded bg-ink-black-200 w-3/4" />
                  ))}
                </div>
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className={`px-4 py-2.5 grid grid-cols-4 gap-4 ${row % 2 === 1 ? "bg-ink-black-50" : "bg-white"}`}>
                    <div className="h-2 rounded bg-ink-black-100 w-4/5" />
                    <div className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${row === 1 ? "bg-red-400" : "bg-emerald-400"}`} />
                      <div className="h-2 rounded bg-ink-black-100 w-3/4" />
                    </div>
                    <div className="h-2 rounded bg-ink-black-100 w-2/3" />
                    <div className="h-2 rounded bg-ink-black-100 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Metrics bar */}
      <section className="border-b border-alabaster-grey-200 bg-white py-16">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-12 px-6 text-center">
          {[
            { value: "20+", label: "security checks per scan" },
            { value: "15", label: "attack paths probed per app" },
            { value: "$4.88M", label: "avg. cost of one data breach (IBM 2024)" },
            { value: "2 min", label: "from signup to first scan" },
          ].map((stat, i) => (
            <div key={stat.value} className="flex items-center gap-12">
              <div>
                <p className="text-5xl font-bold text-ink-black-600">{stat.value}</p>
                <p className="mt-1 text-sm uppercase tracking-wide text-dusty-denim-600">{stat.label}</p>
              </div>
              {i < 3 && <div className="hidden h-10 w-px bg-alabaster-grey-200 sm:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards - Bento Grid */}
      <section id="features" className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
        <h2 className="mb-3 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 sm:text-4xl">What we catch</h2>
        <p className="mb-16 text-center text-dusty-denim-600">
          20 security checks. Every scan. Automated. No developer required.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => (
            <div key={check.title} className="rounded-2xl border border-alabaster-grey-200 bg-white p-8 transition-all hover:shadow-lg" style={{ boxShadow: "0 1px 3px rgba(12,25,39,0.05)" }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-black-50">
                <span className="text-xl">{check.icon}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink-black-900">{check.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dusty-denim-600">{check.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-alabaster-grey-200 bg-white px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="mb-16 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 sm:text-4xl">How Scantient works</h2>

          {/* Zigzag timeline — desktop */}
          <div className="hidden md:block relative">
            {/* Center vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-alabaster-grey-200" />

            <div className="space-y-16">
              {[
                { step: "1", title: "Register your apps", desc: "Enter the URL of any AI-built app. No code changes, no SDK, no developer involvement required." },
                { step: "2", title: "We scan continuously", desc: "Every 4 hours, Scantient runs 20+ security and health checks from the outside. No access required." },
                { step: "3", title: "Get plain-language alerts", desc: "When something breaks or a vulnerability appears, you get an alert with a ready-to-paste AI fix prompt." },
                { step: "4", title: "Review your governance dashboard", desc: "Weekly compliance reports show every app's status, open findings, and remediation progress." },
              ].map((item, idx) => {
                const isOdd = idx % 2 === 0; // 0-indexed: step 1 (idx=0) → left, step 2 (idx=1) → right
                return (
                  <div key={item.step} className="relative flex items-center">
                    {/* Step number circle — centered on the line */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-prussian-blue-600 text-sm font-bold text-white shadow-md">
                      {item.step}
                    </div>

                    {isOdd ? (
                      /* Odd steps: content on LEFT */
                      <>
                        <div className="w-5/12 pr-16 text-right">
                          <div className="rounded-xl border border-alabaster-grey-200 bg-white p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-ink-black-950">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-dusty-denim-600">{item.desc}</p>
                          </div>
                        </div>
                        <div className="w-7/12" />
                      </>
                    ) : (
                      /* Even steps: content on RIGHT */
                      <>
                        <div className="w-7/12" />
                        <div className="w-5/12 pl-16 text-left">
                          <div className="rounded-xl border border-alabaster-grey-200 bg-white p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-ink-black-950">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-dusty-denim-600">{item.desc}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile fallback — single column vertical stack */}
          <div className="md:hidden space-y-12">
            {[
              { step: "1", title: "Register your apps", desc: "Enter the URL of any AI-built app. No code changes, no SDK, no developer involvement required." },
              { step: "2", title: "We scan continuously", desc: "Every 4 hours, Scantient runs 20+ security and health checks from the outside. No access required." },
              { step: "3", title: "Get plain-language alerts", desc: "When something breaks or a vulnerability appears, you get an alert with a ready-to-paste AI fix prompt." },
              { step: "4", title: "Review your governance dashboard", desc: "Weekly compliance reports show every app's status, open findings, and remediation progress." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-prussian-blue-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink-black-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-dusty-denim-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 text-center sm:py-32">
        <h2 className="mb-3 text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 sm:text-4xl">Works with your stack</h2>
        <p className="mb-12 text-dusty-denim-600">Integrates with the tools your team already uses</p>

        {/* Live integrations */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
        <div className="mb-14 flex flex-wrap items-center justify-center gap-6">
          {integrations.live.map((i) => (
            <div key={i.name} className="flex flex-col items-center gap-2.5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-alabaster-grey-200 bg-white p-3 shadow-sm">
                <Image src={i.logo} alt={i.name} width={40} height={40} unoptimized className="h-full w-full object-contain" />
              </div>
              <span className="text-xs font-medium text-dusty-denim-600">{i.name}</span>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-alabaster-grey-100 px-3 py-1 text-xs font-semibold text-dusty-denim-500">
            Coming soon
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {integrations.soon.map((i) => (
            <div key={i.name} className="flex flex-col items-center gap-2.5 opacity-40">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-alabaster-grey-200 bg-white p-3 shadow-sm grayscale">
                <Image src={i.logo} alt={i.name} width={40} height={40} unoptimized className="h-full w-full object-contain" />
              </div>
              <span className="text-xs font-medium text-dusty-denim-400">{i.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof — radical transparency */}
      <section className="border-y border-alabaster-grey-200 bg-white px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-4 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 sm:text-4xl">Built by people who ship fast</h2>
          <p className="mb-16 text-center text-dusty-denim-600">We run Scantient on Scantient. Here&apos;s what the data actually says.</p>
          <div className="grid gap-8 md:grid-cols-3">
            {socialProof.map((item) => (
              <a
                key={item.stat}
                href={item.href}
                className="group relative rounded-2xl border border-alabaster-grey-200 bg-white p-8 transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ boxShadow: "0 1px 3px rgba(12,25,39,0.05)" }}
              >
                <div className="mb-4 text-3xl">{item.icon}</div>
                <p className="text-4xl font-extrabold tracking-tight text-ink-black-950">{item.stat}</p>
                <p className="mt-1 text-sm font-semibold text-prussian-blue-600">{item.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-dusty-denim-600">{item.detail}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection tiers={tiers} />
      

      {/* FAQ */}
      <section className="border-t border-alabaster-grey-200 bg-white px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-16 text-center text-3xl font-extrabold tracking-[-0.02em] text-ink-black-950 sm:text-4xl">Frequently asked questions</h2>
          <div className="space-y-10">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-bold text-ink-black-900">{faq.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-dusty-denim-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-ink-black-950 px-6 py-24 text-center sm:py-32">
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl">Stop finding out about breaches<br />from your CEO.</h2>
        <p className="mx-auto mt-6 max-w-xl text-alabaster-grey-200">
          Add your first app URL. We start scanning in 60 seconds.
        </p>
        <Link
          href="/signup"
          className="mt-10 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-ink-black-950 transition-colors hover:bg-alabaster-grey-100"
        >
          Get started
        </Link>
      </section>

      <Footer />
    </div>
    </>
  );
}
