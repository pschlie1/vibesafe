import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI App Security Scanner — Find Vulnerabilities Before Your Users Do | Scantient",
  description:
    "AI apps have unique security risks that traditional scanners miss. Scantient checks API key exposure, prompt injection vectors, rate limiting, data leakage, and CORS — in 60 seconds, no code access required.",
  keywords: "AI app security, AI application security scanner, prompt injection detection, AI API security, LLM security testing, AI security vulnerabilities",
  openGraph: {
    title: "AI App Security Scanner — Find Vulnerabilities Before Your Users Do",
    description:
      "Your AI app has unique security risks: exposed API keys, prompt injection vectors, missing rate limits, data leakage, overpermissive CORS. Scantient finds all of them in 60 seconds.",
    url: "https://scantient.com/ai-security",
    siteName: "Scantient",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI App Security Scanner — Find Vulnerabilities Before Your Users Do",
    description:
      "API key exposure, prompt injection, rate limiting, data leakage, CORS — Scantient checks all AI-specific security risks in 60 seconds. No signup required.",
  },
};

export default function AiSecurityPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">

      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-info/30 bg-info/10 px-3 py-1 text-xs font-semibold text-info">
          AI App Security
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-5xl lg:text-6xl">
          Your AI app is live.{" "}
          <span className="text-prussian-blue-600">Is it secure?</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
          AI apps built with LLMs, vector databases, and external API providers have a whole new attack surface.
          Exposed keys, prompt injection, unprotected endpoints — Scantient scans your deployed app the same way
          an attacker would, in 60 seconds, no code access required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/score"
            className="rounded-lg bg-prussian-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
          >
            Scan Your AI App Free →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-8 py-3.5 text-base font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-50 dark:hover:bg-prussian-blue-900/30"
          >
            See pricing
          </Link>
        </div>
      </div>

      {/* Why AI apps are different */}
      <div className="mt-24">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-3xl">
          Why AI apps have unique security risks
        </h2>
        <p className="mt-4 text-base leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
          Traditional web app security is about protecting data. AI app security is about protecting data{" "}
          <em>and</em> protecting the intelligent system that processes it — which can be manipulated, extracted
          from, and abused in ways that a CRUD endpoint cannot.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "💸",
              title: "You pay per attack request",
              body: "Every call to your LLM endpoint costs real money. An unprotected /api/chat endpoint doesn't just leak data — it lets attackers run up your OpenAI bill. $10,000 bills from stolen API keys are documented and not rare.",
            },
            {
              icon: "🧠",
              title: "Prompt injection bypasses logic",
              body: 'Attackers don\'t need code access. They craft inputs that hijack your LLM\'s behavior, override your system prompt, or trigger tool calls on your behalf. It\'s SQL injection — but the database is a language model.',
            },
            {
              icon: "🔑",
              title: "LLM keys are high-value targets",
              body: "An exposed OPENAI_API_KEY or ANTHROPIC_API_KEY isn't just a credential — it's an open billing account. Unlike database credentials, attackers can monetize stolen LLM keys immediately.",
            },
            {
              icon: "📊",
              title: "RAG systems can leak cross-user data",
              body: "If your vector store isn't tenant-isolated, crafted queries can retrieve documents belonging to other users. Standard auth doesn't protect against this at the retrieval layer.",
            },
            {
              icon: "🌐",
              title: "CORS misconfig enables LLM abuse",
              body: "A wildcard CORS policy on your AI endpoints lets any website call your backend, consume your LLM quota, and rack up inference costs — without ever visiting your app.",
            },
            {
              icon: "🛡️",
              title: "Traditional tools scan the wrong layer",
              body: "SAST tools scan code. SCA tools scan dependencies. Neither checks your deployed, running app the way an attacker does — from the outside, with no special access.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-surface-raised p-6"
            >
              <span className="text-2xl">{item.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What Scantient checks */}
      <div className="mt-24">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-3xl">
          What Scantient checks on your AI app
        </h2>
        <p className="mt-4 text-base leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
          Every scan covers the fundamentals plus the AI-specific risk layer. No code access, no SDK, no agents.
          Just your URL.
        </p>
        <div className="mt-8 space-y-4">
          {[
            {
              title: "API Key Exposure",
              severity: "Critical",
              severityColor: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
              body: "Scans your JavaScript bundle, API responses, and HTTP headers for 20+ API key patterns — including OpenAI, Anthropic, Gemini, Pinecone, Hugging Face, and other LLM providers. Exposed LLM keys are treated as critical severity because the financial and reputational damage is immediate.",
            },
            {
              title: "Prompt Injection Vectors",
              severity: "High",
              severityColor: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
              body: "Identifies endpoints that pass user input directly to LLM prompts without validation signals. Checks for input length limits, structured input schemas, and response validation patterns that indicate your app defends against prompt injection.",
            },
            {
              title: "Rate Limiting on AI Endpoints",
              severity: "High",
              severityColor: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
              body: "Checks for X-RateLimit headers on endpoints that accept user input. Missing rate limits on LLM-backed endpoints are flagged as high severity — they're a direct path to bill abuse. Scantient tests per-IP and per-user rate limiting signals.",
            },
            {
              title: "Data Leakage Signals",
              severity: "High",
              severityColor: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
              body: "Checks API responses for unintentional data exposure — internal server details, error stack traces, user data fields, and system prompt contents. Also flags verbose error messages that help attackers understand your backend architecture.",
            },
            {
              title: "CORS Configuration",
              severity: "Medium–High",
              severityColor: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
              body: "Verifies that CORS policies on your AI endpoints are locked to specific origins, not wildcard (*). A wildcard CORS policy on an AI endpoint is treated as high severity. Scantient tests CORS on all detected API routes.",
            },
            {
              title: "Security Headers",
              severity: "Medium",
              severityColor: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
              body: "Checks all 5 critical security headers: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy. Missing headers are scored and explained with one-liner fixes.",
            },
          ].map((check) => (
            <div
              key={check.title}
              className="flex gap-4 rounded-xl border border-border p-6"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
                    {check.title}
                  </h3>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${check.severityColor}`}
                  >
                    {check.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
                  {check.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-24">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-3xl">
          How it works
        </h2>
        <p className="mt-4 text-base leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
          No setup. No SDK. No agents. Just your deployed URL.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Enter your URL",
              body: "Paste your app's URL — the live, deployed version. No staging environments, no localhost. Scantient scans the same surface an attacker sees.",
            },
            {
              step: "02",
              title: "60-second scan",
              body: "Scantient crawls your app, inspects HTTP responses, checks API routes, probes headers, and tests CORS — all from the outside. No code access, no npm install.",
            },
            {
              step: "03",
              title: "Actionable report",
              body: "You get a scored security report: what's broken, how bad it is, and a specific one-liner to fix each issue. Not vague recommendations — exact fixes.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="text-4xl font-extrabold text-prussian-blue-100 dark:text-prussian-blue-900">
                {item.step}
              </div>
              <h3 className="mt-2 text-base font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="mt-24 rounded-2xl border border-border bg-surface-raised p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-dusty-denim-500">
          Trusted by indie developers
        </p>
        <p className="mt-3 text-2xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
          50+ indie developers have scanned their AI apps with Scantient
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
          From solo founders shipping their first LLM app to small teams maintaining AI-powered SaaS products.
          Most find at least one high-severity issue on their first scan.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { stat: "60s", label: "Time to first result" },
            { stat: "0", label: "Code access required" },
            { stat: "20+", label: "LLM API key patterns detected" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-surface p-5">
              <div className="text-3xl font-extrabold text-prussian-blue-600">{item.stat}</div>
              <div className="mt-1 text-sm text-dusty-denim-600 dark:text-dusty-denim-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-10 text-center">
        <h2 className="text-2xl font-extrabold text-ink-black-950 dark:text-alabaster-grey-50 sm:text-3xl">
          Find your AI app&apos;s vulnerabilities before your users do
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
          No signup required. No credit card. Just paste your URL and get an instant security report.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/score"
            className="rounded-lg bg-prussian-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
          >
            Scan Your AI App Free →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-8 py-3.5 text-base font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
          >
            Get lifetime access for $79
          </Link>
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-12 border-t border-border pt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-dusty-denim-500 mb-4">
          Go deeper on AI app security
        </h3>
        <div className="flex flex-col gap-3">
          <Link href="/blog/securing-ai-app-api" className="text-sm text-prussian-blue-600 hover:underline">
            Securing Your AI App&apos;s API: What to Check Before Launch →
          </Link>
          <Link href="/blog/7-api-security-mistakes" className="text-sm text-prussian-blue-600 hover:underline">
            7 API Security Mistakes Killing Your Startup →
          </Link>
          <Link href="/pricing" className="text-sm text-prussian-blue-600 hover:underline">
            Continuous monitoring: get alerted when your security posture changes →
          </Link>
        </div>
      </div>

    </div>
  );
}
