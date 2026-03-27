import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Is External Security Scanning? (And Why Every Production API Needs It) | Scantient Blog",
  description:
    "External security scanning tests your live API the way an attacker would . from the outside. Learn what it covers, why code-level tools miss it, and why every production API needs it.",
  keywords: "external security scanning, production API security scan, external API scanner, runtime security testing, API security monitoring",
  openGraph: {
    title: "What Is External Security Scanning? (And Why Every Production API Needs It)",
    description:
      "Code review and dependency scanners can't see what your running API looks like from the outside. External scanning can. Here's what it covers and why it matters.",
    url: "https://scantient.com/blog/what-is-external-security-scanning",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-16T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is External Security Scanning? (And Why Every Production API Needs It)",
    description:
      "External security scanning tests your live API from the attacker's perspective. No code access required. Here's why every production API needs it.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What Is External Security Scanning? (And Why Every Production API Needs It)",
  description:
    "External security scanning tests your live API the way an attacker would . from the outside. Learn what it covers, why code-level tools miss it, and why every production API needs it.",
  datePublished: "2026-03-16T00:00:00Z",
  dateModified: "2026-03-21T00:00:00Z",
  author: { "@type": "Person", "name": "Peter Schliesmann", "url": "https://scantient.com/about", "jobTitle": "Founder", "sameAs": ["https://www.linkedin.com/in/peterschliesmann"] },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/what-is-external-security-scanning",
  mainEntityOfPage: "https://scantient.com/blog/what-is-external-security-scanning",
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
      name: "What Is External Security Scanning?",
      item: "https://scantient.com/blog/what-is-external-security-scanning",
    },
  ],
};

export default function WhatIsExternalSecurityScanningPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is external security scanning?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "External security scanning tests your application from outside your network, the same perspective a real attacker has. It checks what is visible and reachable from the public internet without any insider knowledge of your systems."
      }
    },
    {
      "@type": "Question",
      "name": "Why is external scanning different from code review?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Code review catches issues in the source. External scanning tests the running system. A configuration mistake, a forgotten endpoint, or a deployment error won't show up in code review but will show up in an external scan."
      }
    },
    {
      "@type": "Question",
      "name": "How does Scantient perform external security scanning?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scantient scans your API endpoints as an external client, running 20 automated checks including authentication verification, CORS testing, rate limiting checks, and security header analysis. It runs in your CI pipeline so every deployment is checked before it ships."
      }
    }
  ]
}) }}
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
            <span className="rounded-full bg-prussian-blue-100 dark:bg-prussian-blue-900/40 px-2.5 py-0.5 text-xs font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 border border-prussian-blue-200 dark:border-prussian-blue-700">
              Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            What Is External Security Scanning? (And Why Every Production API Needs It)
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            Your code review finds bugs. Your dependency scanner finds CVEs. But neither one can
            see what your live API looks like from the internet. External scanning can . and it
            reveals a completely different class of security problems.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-16">March 16, 2026</time>
            <span>·</span>
            <span>9 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <h2>The Gap Between Your Code and Your Running API</h2>
          <p>
            There are two fundamentally different ways to analyze the security of an application:
          </p>
          <ul>
            <li>
              <strong>Inside-out (static analysis):</strong> Look at the source code, dependencies,
              and configuration files. Find vulnerable packages, insecure coding patterns, committed
              secrets.
            </li>
            <li>
              <strong>Outside-in (external scanning):</strong> Make real requests to the running
              application from the internet. See exactly what an attacker sees . response headers,
              CORS behavior, exposed endpoints, SSL configuration, runtime data exposure.
            </li>
          </ul>
          <p>
            Most developer security tools operate inside-out. Snyk scans your{" "}
            <code>package.json</code>. Semgrep reads your TypeScript. GitGuardian watches your git
            history. These are all valuable . but they all require access to your code and operate
            before your app is deployed.
          </p>
          <p>
            External security scanning operates outside-in. It doesn&apos;t need your code. It doesn&apos;t
            need your credentials. It talks to your live, deployed API the same way an attacker
            would . and it reveals what your app actually looks like on the internet, which is
            often very different from what you intended.
          </p>

          <h2>What External Scanning Actually Tests</h2>
          <p>
            A production API security scan from the outside covers several categories of issues
            that code analysis simply cannot detect:
          </p>

          <h3>Security Headers</h3>
          <p>
            Security headers like <code>Content-Security-Policy</code>,{" "}
            <code>Strict-Transport-Security</code>, <code>X-Frame-Options</code>, and{" "}
            <code>X-Content-Type-Options</code> are set in your server&apos;s HTTP responses . not in
            your application code. They can be present in your <code>next.config.js</code> but
            missing in production if your hosting platform overrides them. They can be configured
            correctly in staging and broken in your CDN layer. The only way to know what headers
            your users actually receive is to check the live response.
          </p>

          <h3>CORS Configuration</h3>
          <p>
            Cross-Origin Resource Sharing policies define which domains can make authenticated
            requests to your API. A wildcard{" "}
            <code>Access-Control-Allow-Origin: *</code> policy is only visible in the HTTP response
            . it doesn&apos;t exist anywhere in your static codebase until your server generates it.
            External scanning sends probe requests designed to reveal your CORS policy and flag
            overpermissive configurations that could enable cross-site attacks.
          </p>

          <h3>SSL/TLS Configuration</h3>
          <p>
            SSL certificate validity, expiry, and cipher suite configuration are runtime properties
            of your deployment. Your certificate can be valid in code review and expire 14 days
            later in production. External scanning continuously monitors your certificate and alerts
            you before it causes a visible outage.
          </p>

          <h3>Exposed Endpoints and Path Probing</h3>
          <p>
            Attackers automatically probe new domains for common dangerous paths:{" "}
            <code>/.env</code>, <code>/.git/HEAD</code>, <code>/api/admin</code>,{" "}
            <code>/phpinfo.php</code>, Spring Boot actuators, debug endpoints. External scanning
            checks the same paths and tells you which ones respond . before an attacker finds them.
          </p>

          <h3>API Key and Secret Exposure</h3>
          <p>
            API keys can appear in JavaScript bundles, API responses, HTML comments, or error
            messages . all at runtime, in ways that aren&apos;t visible in source code alone. External
            scanning reads your app&apos;s actual HTTP responses and JavaScript bundles looking for
            patterns that match known API key formats (OpenAI, Stripe, AWS, Supabase, and dozens
            more).
          </p>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              See what your API looks like from the outside
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Free external scan. 60 seconds. No signup or SDK required.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>Why &quot;We Already Use Snyk&quot; Isn&apos;t Enough</h2>
          <p>
            Snyk, Dependabot, and similar tools solve a real problem: vulnerable dependencies. If
            your app uses a version of <code>express</code> with a known path traversal
            vulnerability, they&apos;ll tell you. That matters.
          </p>
          <p>
            But consider this scenario: your app has no vulnerable dependencies. Your code passed
            static analysis. Your secrets are in environment variables. And your production
            deployment has:
          </p>
          <ul>
            <li>No <code>Content-Security-Policy</code> header (your CDN stripped it)</li>
            <li>
              <code>Access-Control-Allow-Origin: *</code> (a developer set it for local debugging
              and it shipped to production)
            </li>
            <li>An SSL certificate expiring in 8 days (no one noticed)</li>
            <li>
              <code>/api/health</code> returning a JSON object with your database connection string
              in it (added during a debugging session)
            </li>
          </ul>
          <p>
            Snyk would find none of these. They&apos;re not dependency vulnerabilities. They&apos;re
            runtime configuration problems . and they&apos;re exactly the kind of issue that external
            scanning is designed to catch.
          </p>
          <p>
            This is why CTOs who care about security use both types of tools . not one or the
            other. For the full strategic breakdown:{" "}
            <Link href="/blog/why-ctos-choose-external-security-scanning" className="text-prussian-blue-600 hover:underline">
              Why CTOs Choose External Security Scanning Over Code-Level Tools
            </Link>
            .
          </p>

          <h2>When Should You Run an External Scan?</h2>
          <p>
            The honest answer: continuously. Security is not a one-time event. Every deployment can
            introduce new issues. Every infrastructure change can break existing controls. Every
            dependency update can change runtime behavior.
          </p>
          <p>
            Practically speaking, run an external security scan:
          </p>
          <ul>
            <li>
              <strong>Before launch</strong> . catch the obvious issues before your first real
              users arrive. New domains get probed by automated scanners within hours of
              registration.
            </li>
            <li>
              <strong>After every significant deployment</strong> . configuration changes, new
              routes, infrastructure updates. Verify nothing broke.
            </li>
            <li>
              <strong>On a regular schedule</strong> . SSL certificates expire, dependencies
              accumulate CVEs, and CORS policies drift. Monthly isn&apos;t enough; weekly is better.
            </li>
            <li>
              <strong>When onboarding a new enterprise customer</strong> . many enterprise
              procurement teams now require a recent security assessment as part of vendor
              evaluation.
            </li>
          </ul>

          <h2>What External Scanning Doesn&apos;t Replace</h2>
          <p>
            To be clear: external scanning is one layer of a defense-in-depth approach, not a
            replacement for everything else.
          </p>
          <p>
            It doesn&apos;t replace:
          </p>
          <ul>
            <li>Code review for application logic flaws</li>
            <li>Dependency scanning for CVEs in your packages</li>
            <li>Secrets scanning to prevent credentials from being committed to git</li>
            <li>
              Penetration testing for complex, multi-step attack chains that require human
              judgment
            </li>
          </ul>
          <p>
            What it <em>does</em> provide is visibility into the gap that all of those tools miss:
            what your API actually looks like, in production, right now, to someone on the
            internet.
          </p>

          <h2>How to Get Started</h2>
          <p>
            The lowest-friction way to understand your external security posture is a one-click
            scan. No setup, no SDK, no code access required . just paste your URL.
          </p>
          <p>
            <Link href="/score" className="text-prussian-blue-600 hover:underline">
              Scantient&apos;s free scan
            </Link>{" "}
            runs in 60 seconds and checks your live API for headers, CORS policy, SSL configuration,
            dangerous path exposure, and API key leakage. For production apps that need continuous
            monitoring,{" "}
            <Link href="/pricing" className="text-prussian-blue-600 hover:underline">
              the lifetime plan is $79
            </Link>{" "}
            . one payment, no recurring fees.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . See What an Attacker Sees
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            External security scan: headers, CORS, SSL, exposed endpoints, API key exposure. 60 seconds. No signup.
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
              href="/blog/why-ctos-choose-external-security-scanning"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Why CTOs Choose External Security Scanning Over Code-Level Tools →
            </Link>
            <Link
              href="/blog/api-security-complete-guide"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              API Security: The Complete Guide for Developers (2026) →
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Scantient Pricing . Lifetime Access from $79 →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
