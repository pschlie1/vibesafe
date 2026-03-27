import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Deploy Just Went Live. Now Run This Security Checklist. | Scantient Blog",
  description:
    "A practical post-deploy security checklist covering SSL, security headers, exposed endpoints, API keys, CORS, CSP, and rate limits. Run Scantient in 60 seconds to check all of these automatically.",
  keywords: "post-deploy security, production security checklist, deploy security check, post-launch security, api security checklist",
  openGraph: {
    title: "Your Deploy Just Went Live. Now Run This Security Checklist.",
    description:
      "SSL, security headers, CORS, API keys, exposed endpoints, CSP, rate limits. The production security checklist every indie dev should run before tweeting their launch.",
    url: "https://scantient.com/blog/post-deploy-security-checklist",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-02-05T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Deploy Just Went Live. Now Run This Security Checklist.",
    description:
      "The post-deploy security checklist: SSL, headers, CORS, exposed keys, CSP, rate limits. Check all of it in 60 seconds.",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://scantient.com/blog" },
    { "@type": "ListItem", position: 3, name: "Post-Deploy Security Checklist", item: "https://scantient.com/blog/post-deploy-security-checklist" },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Your Deploy Just Went Live. Now Run This Security Checklist.",
  description: "A practical post-deploy security checklist covering SSL, security headers, exposed endpoints, API keys, CORS, CSP, and rate limits.",
  datePublished: "2026-02-05T00:00:00Z",
  publisher: { "@type": "Organization", name: "Scantient", url: "https://scantient.com" },
  mainEntityOfPage: "https://scantient.com/blog/post-deploy-security-checklist",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".article-lede"],
  },
};

const checklistItems = [
  {
    number: "01",
    title: "SSL Certificate Valid and Not Expiring Soon",
    severity: "Critical",
    severityColor: "bg-error/10 text-error border-error/20",
    body: [
      "Your SSL certificate is the first thing every visitor's browser checks. If it's expired, every user sees a security warning and most will leave immediately. If it's about to expire (within 30 days), you're one missed renewal away from a complete site outage.",
      "What to verify: Certificate is valid. Expiry is more than 30 days away. Auto-renewal is configured (Let's Encrypt on most platforms handles this). HTTPS is enforced . HTTP requests redirect to HTTPS, not serve content.",
      "Common failure mode: You set up Let's Encrypt manually six months ago. The cron job for renewal failed silently. You find out when a customer emails you that your site is \"not secure.\"",
    ],
    fix: "Run a scan on your domain and check the certificate validity and expiry date. Set a reminder 30 days before expiry for any cert you manage manually.",
  },
  {
    number: "02",
    title: "Security Headers Are Present and Correct",
    severity: "High",
    severityColor: "bg-warning/10 text-warning border-warning/20",
    body: [
      "Security headers are HTTP response headers that tell browsers how to handle your app. They're invisible to users but protect against XSS, clickjacking, MIME sniffing, and protocol downgrade attacks. Missing them is a free vulnerability that requires no exploitation . it's just not protected.",
      "The five headers you need: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, Referrer-Policy.",
      "In Next.js, add them in next.config.js under the headers() function. In Express, use the helmet middleware . it adds all of these in one line.",
    ],
    fix: "An external scan checks for all five headers and tells you which are missing. Takes 60 seconds.",
  },
  {
    number: "03",
    title: "No API Keys Exposed in Client-Side Code or Responses",
    severity: "Critical",
    severityColor: "bg-error/10 text-error border-error/20",
    body: [
      "This is the most common critical finding in post-deploy scans . and the most embarrassing, because it's entirely preventable. An API key that leaks in a JavaScript bundle or API response is immediately readable to anyone who opens DevTools.",
      "What gets exposed: OpenAI API keys (someone racks up a huge bill). Stripe secret keys (someone processes fraudulent charges). Supabase service role keys (someone reads your entire database). AWS credentials (someone mines crypto in your account).",
      "The rule: any key that says 'secret,' 'private,' or 'service_role' stays on the server. Use NEXT_PUBLIC_ only for genuinely public configuration (publishable Stripe keys, analytics IDs, feature flags).",
    ],
    fix: "Scan your JavaScript bundle and API responses for key patterns. Scantient checks for 20+ formats including all major cloud providers and LLM APIs.",
  },
  {
    number: "04",
    title: "CORS Is Locked to Your Domain",
    severity: "High",
    severityColor: "bg-warning/10 text-warning border-warning/20",
    body: [
      "CORS (Cross-Origin Resource Sharing) controls which websites can make requests to your API from a browser. If you set Access-Control-Allow-Origin: * (the developer's shortcut when CORS errors appear), you've told every website in the world they can make requests to your API.",
      "For most APIs, this means: malicious sites can read your users' data on their behalf (using their session cookies). For AI APIs, it also means: attackers can run LLM inference at your expense from any website.",
      "The correct setting for production: Access-Control-Allow-Origin: https://yourapp.com . your specific domain only.",
    ],
    fix: "External scans probe your API endpoints and check CORS headers. Wildcard policies are flagged immediately.",
  },
  {
    number: "05",
    title: "Debug and Sensitive Endpoints Return 404",
    severity: "High",
    severityColor: "bg-warning/10 text-warning border-warning/20",
    body: [
      "Within minutes of a new domain appearing in DNS, automated scanners probe it for common sensitive paths. These include: /.env, /.git/HEAD, /api/debug, /admin, /phpinfo.php, Spring Boot actuators like /actuator/health, /actuator/env, and dozens more.",
      "If any of these return 200 (OK), they're exposing data. A /.env response leaks your entire environment. A /.git/HEAD response confirms your stack. A /api/debug endpoint might expose request logs, user data, or internal state.",
      "The fix isn't just 403 Forbidden . return 404. A 403 tells an attacker the endpoint exists and they just can't access it. A 404 is a dead end.",
    ],
    fix: "A good external scan tests 15+ of these paths automatically. Check your scan results for any that return 200.",
  },
  {
    number: "06",
    title: "Content Security Policy Is Configured (Not Just Present)",
    severity: "Medium",
    severityColor: "bg-info/10 text-info border-info/20",
    body: [
      "Adding a Content-Security-Policy header is step one. But a misconfigured CSP provides false security. Common mistakes: using unsafe-inline without a nonce (defeats the purpose of CSP), using wildcard source directives (script-src *), or setting a CSP that's so restrictive it breaks your app and gets removed.",
      "A well-configured CSP prevents: XSS attacks from executing injected scripts, data exfiltration to unauthorized domains, clickjacking and UI redressing.",
      "Start with report-only mode if you're not sure: Content-Security-Policy-Report-Only lets you test your policy without breaking anything. Tighten it over time.",
    ],
    fix: "Check that your CSP header is present, non-trivial (not just script-src *), and includes a nonce or hash for inline scripts.",
  },
  {
    number: "07",
    title: "Rate Limits Are Active on API Endpoints",
    severity: "Medium",
    severityColor: "bg-info/10 text-info border-info/20",
    body: [
      "Rate limiting is what stands between your production infrastructure and a script that hammers your API 10,000 times per minute. Without it: your database gets overloaded, your LLM bill spikes, and a determined attacker can brute-force auth endpoints.",
      "For AI apps specifically, rate limiting is critical . every unprotected request to an LLM endpoint costs you money. For auth endpoints (login, signup, forgot-password), rate limiting prevents credential stuffing attacks.",
      "Minimum viable rate limiting: 100 requests/minute per IP on API endpoints. Stricter for auth endpoints (10/minute). Stricter still for LLM endpoints (10/minute per user).",
    ],
    fix: "Check for X-RateLimit-Limit and X-RateLimit-Remaining headers in your API responses. Their absence doesn't always mean no rate limiting, but their presence confirms it.",
  },
];

export default function PostDeploySecurityChecklistPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What security checks should run after deploying an API?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "After deploying, verify HTTPS is enforced, check that security headers are present, confirm rate limiting is active, test authentication on new endpoints, and review logs for unexpected traffic patterns. Run a full security scan to catch any regressions."
      }
    },
    {
      "@type": "Question",
      "name": "How often should I run security checks on a deployed API?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Run automated scans on every deployment using your CI pipeline. Run deeper manual checks before major releases. Monitor logs continuously for anomalous patterns that may indicate probing or attack."
      }
    },
    {
      "@type": "Question",
      "name": "What is the most common post-deploy security gap?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Forgetting to restrict debug endpoints and error verbosity in production is one of the most common gaps. Development conveniences like detailed stack traces and admin routes often make it into production when deployment processes aren't security-aware."
      }
    }
  ]
}) }}
      />

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/blog" className="text-sm text-dusty-denim-600 hover:text-prussian-blue-600 transition-colors">
            ← Blog
          </Link>
          <span className="text-sm text-dusty-denim-400">/</span>
          <span className="rounded-full bg-prussian-blue-600/10 px-2.5 py-0.5 text-xs font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 border border-prussian-blue-600/20">
            Checklist
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
          Your Deploy Just Went Live. Now Run This Security Checklist.
        </h1>
        <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400 article-lede">
          Shipping is the goal. But in the five minutes between &quot;deployed to Vercel&quot; and &quot;posted the link on Twitter,&quot; automated scanners are already probing your new domain. Here&apos;s what to check . and how to check it in under 60 seconds.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
          <time dateTime="2026-02-05">February 5, 2026</time>
          <span>·</span>
          <span>8 min read</span>
        </div>
      </div>

      {/* Body intro */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>
          The average time between a new domain appearing in certificate transparency logs and the first automated security probe: under 10 minutes. Attackers don&apos;t wait for you to get traction . they scan everything, looking for easy wins.
        </p>
        <p>
          Most post-deploy security failures aren&apos;t sophisticated. They&apos;re the same seven issues, in the same order, on almost every new app. This checklist covers all of them. You can check most of these manually, or run a <Link href="/score" className="text-prussian-blue-600 hover:underline">Scantient scan</Link> and get all of them in one result in 60 seconds.
        </p>
      </div>

      {/* Checklist items */}
      <div className="mt-10 space-y-10">
        {checklistItems.map((item) => (
          <div key={item.number} className="rounded-2xl border border-alabaster-grey-200 dark:border-ink-black-800 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl font-black text-alabaster-grey-300 dark:text-ink-black-700 tabular-nums shrink-0">{item.number}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">{item.title}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${item.severityColor}`}>
                    {item.severity}
                  </span>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-dusty-denim-700 dark:text-dusty-denim-400">
                  {item.body.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-prussian-blue-50 dark:bg-prussian-blue-950/30 border border-prussian-blue-100 dark:border-prussian-blue-900 px-4 py-3">
                  <p className="text-xs font-semibold text-prussian-blue-700 dark:text-prussian-blue-300">How to check: {item.fix}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary checklist */}
      <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
        <h2>The Quick Reference: Paste This Into Your Launch Checklist</h2>
        <ul>
          <li>✅ SSL certificate valid, expires in 30+ days, auto-renewal active</li>
          <li>✅ HTTPS enforced . HTTP redirects to HTTPS</li>
          <li>✅ Security headers present: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy</li>
          <li>✅ No secret API keys in JavaScript bundle or API responses</li>
          <li>✅ CORS locked to specific origins (no wildcard <code>*</code>)</li>
          <li>✅ Sensitive paths return 404: /.env, /.git/HEAD, /api/debug, /admin</li>
          <li>✅ CSP is non-trivial and configured with a nonce or hash</li>
          <li>✅ Rate limiting active on API endpoints (especially auth and LLM endpoints)</li>
          <li>✅ <Link href="/score" className="text-prussian-blue-600 hover:underline">External security scan run</Link> . Scantient checks all of the above in 60 seconds</li>
        </ul>

        <h2>The One Command That Replaces Most of This</h2>
        <p>
          You can manually check headers with <code>curl -I https://yourapp.com</code>. You can inspect your JavaScript bundle in DevTools. You can probe your own sensitive paths.
        </p>
        <p>
          Or you can paste your URL into <Link href="/score" className="text-prussian-blue-600 hover:underline">Scantient</Link> and get all seven checks . with severity ratings and specific fix instructions . in 60 seconds. No signup. No SDK. No setup.
        </p>
        <p>
          The free scan covers everything in this checklist. If you want continuous monitoring (alerts when your security posture changes after each deploy, monthly compliance reports), <Link href="/pricing" className="text-prussian-blue-600 hover:underline">the lifetime deal is $79</Link>. One-time payment, no recurring fees . worth it for peace of mind on every future deploy.
        </p>
        <p>
          For AI apps specifically, add the items from our guide on <Link href="/blog/securing-ai-app-api" className="text-prussian-blue-600 hover:underline">securing your AI app&apos;s API</Link> to this checklist . LLM endpoints have additional risks (rate limiting, CORS, prompt injection) that go beyond what standard security scanners check.
        </p>
        <p>
          If you haven&apos;t already run through pre-launch security, the <Link href="/blog/indie-dev-security-checklist" className="text-prussian-blue-600 hover:underline">full indie dev security checklist</Link> covers everything from environment variable hygiene to database access controls. And the fastest way to verify your post-deploy posture right now:{" "}
          <Link href="/score" className="text-prussian-blue-600 hover:underline">Run a live external scan post-deploy</Link> . it checks all seven categories above in 60 seconds, no signup required.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
        <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
          Run your post-deploy security scan now
        </h3>
        <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
          60 seconds. No signup. No SDK. Scantient checks every item on this list automatically.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/score"
            className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
          >
            Run a free scan now →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-6 py-3 text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
          >
            Get lifetime access for $79
          </Link>
        </div>
      </div>

      {/* Related */}
      <div className="mt-12 border-t border-border pt-8">
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-4">Related</h3>
        <div className="flex flex-col gap-3">
          <Link href="/blog/7-api-security-mistakes" className="text-sm text-prussian-blue-600 hover:underline">
            7 API Security Mistakes Killing Your Startup →
          </Link>
          <Link href="/blog/securing-ai-app-api" className="text-sm text-prussian-blue-600 hover:underline">
            Securing Your AI App&apos;s API: What to Check Before Launch →
          </Link>
          <Link href="/blog/indie-dev-security-checklist" className="text-sm text-prussian-blue-600 hover:underline">
            The Indie Dev Security Checklist: Ship Fast Without Getting Hacked →
          </Link>
        </div>
      </div>
    </article>
    </>
  );
}
