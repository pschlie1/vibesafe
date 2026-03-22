import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Scan Your Production API for Vulnerabilities (Step-by-Step Guide) | Scantient Blog",
  description:
    "A step-by-step guide to scanning your production API for security vulnerabilities . headers, CORS, exposed endpoints, TLS, and data leakage. No expensive tools required.",
  keywords: "scan production API vulnerabilities, API vulnerability scanner, how to scan API security, production API security test, external API scan",
  openGraph: {
    title: "How to Scan Your Production API for Vulnerabilities (Step-by-Step Guide)",
    description:
      "Step-by-step: how to scan your live API for security vulnerabilities from the outside. Headers, CORS, endpoints, TLS, data leakage . and how to fix what you find.",
    url: "https://scantient.com/blog/how-to-scan-production-api",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-02-08T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Scan Your Production API for Vulnerabilities (Step-by-Step Guide)",
    description:
      "How to find vulnerabilities in your live production API . a practical walkthrough from external scan to fixed findings.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Scan Your Production API for Vulnerabilities (Step-by-Step Guide)",
  description:
    "A step-by-step guide to scanning your production API for security vulnerabilities . headers, CORS, exposed endpoints, TLS, and data leakage. No expensive tools required.",
  datePublished: "2026-02-08T00:00:00Z",
  dateModified: "2026-02-08T00:00:00Z",
  author: { "@type": "Organization", name: "Scantient" },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/how-to-scan-production-api",
  mainEntityOfPage: "https://scantient.com/blog/how-to-scan-production-api",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://scantient.com/blog" },
    {
      "@type": "ListItem",
      position: 3,
      name: "How to Scan Your Production API for Vulnerabilities (Step-by-Step Guide)",
      item: "https://scantient.com/blog/how-to-scan-production-api",
    },
  ],
};

export default function HowToScanProductionApiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Link
              href="/blog"
              className="text-sm text-dusty-denim-600 hover:text-prussian-blue-600 transition-colors"
            >
              ← Blog
            </Link>
            <span className="text-sm text-dusty-denim-400">/</span>
            <span className="rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error border border-error/20">
              API Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            How to Scan Your Production API for Vulnerabilities (Step-by-Step Guide)
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            Your code looks clean in review. Your tests pass. But what does your live API look like
            to someone probing it from the internet? This guide walks through how to find out .
            step by step.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-02-08">February 8, 2026</time>
            <span>·</span>
            <span>7 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            Most API security problems aren&apos;t in the code . they&apos;re in the configuration. Missing
            headers. Overpermissive CORS. Endpoints that respond to unauthenticated requests.
            These issues are invisible to static analysis tools and unit tests because they only
            appear when your API is actually running in production, handling real HTTP traffic.
          </p>
          <p>
            The only way to find them is to scan your live API from the outside . the same
            perspective an attacker has. This guide walks through exactly how to do that, step
            by step.
          </p>
          <p>
            For background on why external scanning is a different discipline from code analysis,{" "}
            <Link href="/blog/what-is-external-security-scanning" className="text-prussian-blue-600 hover:underline">
              read this overview of external security scanning
            </Link>
            .
          </p>

          <h2>What You&apos;re Looking For</h2>
          <p>
            A production API vulnerability scan is looking for things that are wrong in the
            deployed state of your application . not in your source code. The main categories:
          </p>
          <ul>
            <li>
              <strong>Missing security headers</strong> . Content-Security-Policy, HSTS,
              X-Frame-Options, X-Content-Type-Options, Referrer-Policy. These control browser
              behavior and prevent a range of client-side attacks.
            </li>
            <li>
              <strong>Overpermissive CORS</strong> . APIs that return <code>Access-Control-Allow-Origin: *</code>
              on authenticated endpoints, or that reflect arbitrary origins without validation.
            </li>
            <li>
              <strong>Exposed endpoints</strong> . Routes that respond with data or accept
              mutations without requiring authentication. Debug routes, admin endpoints, and
              health checks that return sensitive system information.
            </li>
            <li>
              <strong>TLS/SSL issues</strong> . Expired certificates, weak cipher suites, missing
              HSTS headers, or HTTP-to-HTTPS redirect failures.
            </li>
            <li>
              <strong>Response data leakage</strong> . API responses that include sensitive fields
              (internal IDs, stack traces, environment names, database details) that should be
              stripped before returning to clients.
            </li>
            <li>
              <strong>Missing rate limiting</strong> . Authentication endpoints that accept
              unlimited requests, enabling credential stuffing and brute force attacks.
            </li>
          </ul>

          <h2>Step 1: Run an External Scan</h2>
          <p>
            The fastest way to get an external perspective on your production API is to run an
            automated external scan. You&apos;re looking for a tool that sends real HTTP requests to
            your live endpoints . not one that analyzes your source code.
          </p>
          <p>
            Go to{" "}
            <Link href="/score" className="text-prussian-blue-600 hover:underline font-semibold">
              scantient.com/score
            </Link>{" "}
            and enter your API&apos;s base URL. The scanner will make external requests to your
            endpoints, analyze the responses, and produce a scored report covering:
          </p>
          <ul>
            <li>Security header presence and configuration</li>
            <li>CORS policy analysis</li>
            <li>TLS certificate status and strength</li>
            <li>Accessible endpoint discovery</li>
            <li>Response data field analysis</li>
          </ul>
          <p>
            The whole process takes under 60 seconds. No signup. No SDK or agent to install .
            the scanner operates entirely from the network, seeing exactly what an external
            attacker would see.
          </p>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Ready to scan your API right now?
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Paste your API URL and get a security score in under 60 seconds.
              Free. No signup required.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>Step 2: Review the Security Headers Report</h2>
          <p>
            Once your scan completes, start with the security headers section. This is typically
            where most APIs have the most findings . and most are fixable in under 30 minutes.
          </p>
          <p>
            For each failing header, the fix is usually adding a line to your server configuration
            or Next.js <code>headers()</code> function. Common examples:
          </p>
          <ul>
            <li>
              <strong>Missing HSTS:</strong> Add <code>Strict-Transport-Security: max-age=31536000; includeSubDomains</code>.
              This tells browsers to only connect via HTTPS for the next year.
            </li>
            <li>
              <strong>Missing X-Content-Type-Options:</strong> Add{" "}
              <code>X-Content-Type-Options: nosniff</code>. Prevents browsers from MIME-sniffing
              responses.
            </li>
            <li>
              <strong>Missing X-Frame-Options:</strong> Add <code>X-Frame-Options: DENY</code> to
              prevent your app from being embedded in iframes (clickjacking protection).
            </li>
            <li>
              <strong>Missing CSP:</strong> Content-Security-Policy is more complex . start with a
              restrictive policy and loosen as needed. Even a basic <code>default-src &apos;self&apos;</code>
              is better than nothing.
            </li>
          </ul>
          <p>
            After fixing headers, redeploy and rescan. Header issues should resolve completely
            within one deploy cycle.
          </p>

          <h2>Step 3: Audit Your CORS Configuration</h2>
          <p>
            CORS (Cross-Origin Resource Sharing) findings need more careful attention because the
            right fix depends on your API&apos;s intended consumers.
          </p>
          <p>
            Red flags to look for:
          </p>
          <ul>
            <li>
              <code>Access-Control-Allow-Origin: *</code> on endpoints that handle authenticated
              requests or return user data. Wildcards should never appear on authenticated routes.
            </li>
            <li>
              APIs that reflect the <code>Origin</code> request header directly back in
              <code>Access-Control-Allow-Origin</code> without validation . this effectively
              allows any origin.
            </li>
            <li>
              Missing <code>Vary: Origin</code> header when CORS responses vary by origin .
              this can cause cache poisoning.
            </li>
          </ul>
          <p>
            Fix: explicitly whitelist the origins your API should accept. In Express:{" "}
            <code>cors(&#123; origin: [&apos;https://yourapp.com&apos;] &#125;)</code>. Never use a wildcard on
            authenticated routes.
          </p>

          <h2>Step 4: Investigate Exposed Endpoints</h2>
          <p>
            The exposed endpoints section shows routes that responded to the scanner&apos;s unauthenticated
            requests. Review each one and ask: should this be publicly accessible?
          </p>
          <p>
            Common findings:
          </p>
          <ul>
            <li>
              <strong><code>/api/health</code> or <code>/healthz</code></strong> . These are
              expected to be public. But check what they return . some health endpoints expose
              version numbers, environment names, database connection status, or dependency
              versions. Trim the response to just <code>&#123;"status": "ok"&#125;</code>.
            </li>
            <li>
              <strong>Admin or internal routes</strong> . If <code>/api/admin/*</code> or
              <code>/api/internal/*</code> responds to unauthenticated requests, this is a
              critical finding. Add authentication middleware immediately.
            </li>
            <li>
              <strong>Debug or development routes</strong> . Routes added during development
              and never removed. Common examples: <code>/api/debug</code>,
              <code>/api/test</code>, <code>/api/seed</code>. Delete them.
            </li>
          </ul>

          <h2>Step 5: Check TLS Configuration</h2>
          <p>
            TLS issues are often overlooked because &quot;the padlock is green&quot; in the browser. But
            there&apos;s more to TLS security than certificate validity:
          </p>
          <ul>
            <li>
              <strong>Certificate expiry</strong> . Set up automated renewal (Let&apos;s Encrypt
              certbot, or your platform&apos;s managed certificates). An expired cert breaks your
              app for all users.
            </li>
            <li>
              <strong>HTTP to HTTPS redirect</strong> . Ensure requests to <code>http://</code>
              redirect to <code>https://</code> with a 301 or 308 response. Not a 200.
            </li>
            <li>
              <strong>HSTS preloading</strong> . For high-value APIs, submit your domain to the
              HSTS preload list so browsers never make an insecure connection, even for first
              visits.
            </li>
          </ul>

          <h2>Step 6: Review the Security Score and Prioritize</h2>
          <p>
            Your scan produces a score reflecting overall API security posture. Use it as a
            baseline . not a final grade. The goal isn&apos;t a perfect number; it&apos;s tracking
            meaningful improvement over time.
          </p>
          <p>
            Prioritization framework:
          </p>
          <ol>
            <li>
              <strong>Fix critical findings first</strong> . Unauthenticated access to admin
              endpoints, wildcard CORS on authenticated routes, expired TLS certificates.
            </li>
            <li>
              <strong>Fix header findings next</strong> . These are low effort, high impact,
              and often require only a configuration change.
            </li>
            <li>
              <strong>Schedule data leakage remediation</strong> . Stripping sensitive fields
              from API responses may require code changes and testing.
            </li>
            <li>
              <strong>Set up continuous scanning</strong> . A one-time scan is better than nothing,
              but continuous external monitoring catches new vulnerabilities introduced with each
              deploy.
            </li>
          </ol>

          <h2>What External Scanning Doesn&apos;t Cover</h2>
          <p>
            An external API scan is powerful but not omniscient. It won&apos;t find:
          </p>
          <ul>
            <li>Business logic vulnerabilities (these require understanding your app&apos;s intent)</li>
            <li>SQL injection or injection flaws in specific query parameters</li>
            <li>Authentication bypass flaws in your login flow</li>
            <li>Vulnerabilities in your frontend JavaScript</li>
          </ul>
          <p>
            External scanning catches the configuration-layer vulnerabilities. Code-level
            vulnerabilities require a combination of SAST tools, dependency scanning, and manual
            review. Both perspectives are necessary . they don&apos;t overlap, they complement each
            other.
          </p>

          <h2>Making Scanning a Habit</h2>
          <p>
            The most valuable thing you can do after your first scan is make it a recurring
            practice. Your API changes with every deploy . new endpoints, updated dependencies,
            modified configurations. A scan that was green last month may have new findings today.
          </p>
          <p>
            With{" "}
            <Link href="/pricing" className="text-prussian-blue-600 hover:underline">
              Scantient&apos;s LTD plan
            </Link>
            , you get continuous external monitoring . scans run automatically and you get
            notified when new findings appear. It&apos;s the difference between a security snapshot
            and a security posture.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            Start with Step 1 right now. Paste your production API URL and get a scored external
            security report. No signup, no SDK, no agent.
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
            <Link
              href="/blog/what-is-external-security-scanning"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              What Is External Security Scanning? (And Why Every Production API Needs It) →
            </Link>
            <Link
              href="/blog/api-security-complete-guide"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              API Security: The Complete Guide for Developers (2026) →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
