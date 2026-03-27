import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OWASP Top 10 for APIs: A Practical Checklist for 2026 | Scantient Blog",
  description:
    "The OWASP API Security Top 10 . not just descriptions, but practical fixes for each. How to check, what to implement, and which ones Scantient detects automatically.",
  keywords: "OWASP top 10 API, API security checklist 2026, OWASP API security, API security best practices, REST API security, API vulnerability checklist",
  openGraph: {
    title: "OWASP Top 10 for APIs: A Practical Checklist for 2026",
    description:
      "All 10 OWASP API Security risks with practical fixes . not just definitions. Scantient covers 7 of the 10 automatically. Check your API posture in 60 seconds.",
    url: "https://scantient.com/blog/owasp-top-10-api-checklist",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-10T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "OWASP Top 10 for APIs: A Practical Checklist for 2026",
    description:
      "OWASP API Security Top 10 . practical fixes for all 10. Scantient checks 7 of them automatically. No code access required.",
  },
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
      name: "OWASP Top 10 for APIs: A Practical Checklist for 2026",
      item: "https://scantient.com/blog/owasp-top-10-api-checklist",
    },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "OWASP Top 10 for APIs: A Practical Checklist for 2026",
  description:
    "The OWASP API Security Top 10 . practical fixes for each, not just descriptions. Scantient covers 7 of the 10 automatically.",
  datePublished: "2026-03-10T00:00:00Z",
  publisher: { "@type": "Organization", name: "Scantient", url: "https://scantient.com" },
  mainEntityOfPage: "https://scantient.com/blog/owasp-top-10-api-checklist",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".article-lede"],
  },
};

export default function OwaspTop10ApiChecklistPage() {
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
      "name": "What is the OWASP API Security Top 10?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The OWASP API Security Top 10 lists the most critical risks for APIs: broken object level authorization, broken authentication, broken object property level authorization, unrestricted resource consumption, broken function level authorization, server-side request forgery, security misconfiguration, lack of protection from automated threats, improper asset management, and unsafe consumption of APIs."
      }
    },
    {
      "@type": "Question",
      "name": "How do I check my API against the OWASP Top 10?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Run automated security scans that check for OWASP Top 10 issues as part of your CI pipeline. Scantient covers the most common OWASP API risks in its 20-point scan. Supplement with manual testing for complex authorization scenarios."
      }
    },
    {
      "@type": "Question",
      "name": "Which OWASP API risk causes the most breaches?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Broken object level authorization (BOLA/IDOR) is consistently the most exploited API vulnerability. It allows authenticated users to access other users' data by manipulating resource identifiers. Test every endpoint that returns user-specific data."
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
            <span className="rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-semibold text-info border border-info/20">
              API Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            OWASP Top 10 for APIs: A Practical Checklist for 2026
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400 article-lede">
            The OWASP API Security Top 10 is the industry reference for API vulnerabilities. But most articles just
            list definitions. This one gives you actual fixes . and tells you which ones you can check in 60 seconds without touching code.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-10">March 10, 2026</time>
            <span>·</span>
            <span>12 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            OWASP&apos;s API Security Top 10 (updated for 2023, still the operative standard heading into 2026) is the closest thing to a universal API security checklist. Security auditors use it. Enterprise procurement teams ask about it. Compliance frameworks reference it. If your API is internet-facing, you should know where you stand on all 10.
          </p>
          <p>
            The challenge: most OWASP guides describe <em>what</em> the vulnerability is without telling you <em>what to do about it</em>. This checklist does both. If you want to see these risks in action, the <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">most common API security mistakes</Link> we find in real startups map directly to the OWASP categories below.
          </p>
          <p>
            We&apos;ve also marked which ones Scantient checks automatically in a 60-second external scan . no code access, no SDK, just your URL.
          </p>

          <div className="not-prose my-8 rounded-xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-5">
            <p className="text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300">
              🛡️ Coverage summary: Scantient automatically checks <strong>7 of the 10</strong> OWASP API Security risks from the outside . API1, API3, API4, API7, API8, API9, and API10. The remaining three (API2, API5, API6) require authenticated testing or code-level review.
            </p>
          </div>

          <h2>API1:2023 . Broken Object Level Authorization (BOLA)</h2>

          <p>
            <strong>What it is:</strong> An attacker changes an object ID in a request (<code>/api/orders/1234</code> → <code>/api/orders/1235</code>) and gets back data that belongs to another user. The API doesn&apos;t verify that the requesting user owns the object.
          </p>
          <p>
            <strong>Why it&apos;s #1:</strong> BOLA is the most common API vulnerability because it&apos;s invisible to code reviewers who focus on authentication . the user <em>is</em> authenticated, they&apos;re just accessing someone else&apos;s data. You only find it by testing object ownership, not just auth.
          </p>
          <p>
            <strong>Fix:</strong> Every endpoint that returns data by ID must verify that the authenticated user owns or has explicit permission to access that specific object. This is a server-side check . not something you can enforce in the frontend. Use Row-Level Security (RLS) in Supabase/Postgres, or implement ownership checks in every resolver/handler.
          </p>
          <p>
            <strong>How to check:</strong> Authenticated testing required . create two accounts, get an object ID from one, request it with the other. Scantient can detect patterns that suggest BOLA exposure (predictable sequential IDs, responses with other users&apos; data fields) but full verification requires authenticated testing.
          </p>

          <h2>API2:2023 . Broken Authentication</h2>

          <p>
            <strong>What it is:</strong> Authentication mechanisms are flawed . weak tokens, missing token expiry, insecure credential transmission, or missing brute-force protection.
          </p>
          <p>
            <strong>Fix:</strong> Use battle-tested auth libraries (NextAuth, Clerk, Auth0) instead of rolling your own. Enforce short JWT expiry (15–60 minutes for access tokens). Require refresh token rotation. Rate-limit authentication endpoints. Never transmit credentials in query parameters. Implement account lockout after repeated failures.
          </p>
          <p>
            <strong>How to check:</strong> Partially automatable. Check for rate limiting on <code>/api/auth/login</code> (Scantient checks this). For token strength and expiry . use jwt.io to decode tokens and check <code>exp</code> claims.
          </p>

          <h2>API3:2023 . Broken Object Property Level Authorization (BOPLA)</h2>

          <p>
            <strong>What it is:</strong> APIs return more fields than the user should see (Excessive Data Exposure) or allow users to update fields they shouldn&apos;t be able to modify (Mass Assignment). Both are BOPLA.
          </p>
          <p>
            <strong>Why it happens:</strong> Developers return entire database objects to the frontend because it&apos;s easy. A user object containing <code>email</code>, <code>name</code>, and <code>role</code> gets returned . the frontend only shows <code>name</code>, but <code>role</code> is in the JSON response. An attacker sees it and knows your role values.
          </p>
          <p>
            <strong>Fix:</strong> Define explicit output schemas (using Zod or similar) for every API response. Never return raw database objects. For write endpoints, explicitly allowlist the fields that users can modify . never use <code>Object.assign(req.body, user)</code> patterns.
          </p>
          <p>
            <strong>How to check:</strong> Scantient scans API responses for fields that look like sensitive internal data . admin flags, internal IDs, other users&apos; data patterns. It can&apos;t catch every case, but catches common over-exposure patterns.
          </p>

          <h2>API4:2023 . Unrestricted Resource Consumption</h2>

          <p>
            <strong>What it is:</strong> No limits on how many requests a client can make, how large requests can be, or how much server resource a single request can consume. This enables DoS attacks, bill fraud (especially on AI apps), and resource exhaustion.
          </p>
          <p>
            <strong>Why AI apps are especially vulnerable:</strong> Every LLM inference call costs money. An API endpoint without rate limiting is a direct path to a $10,000 bill. See our deep dive on <Link href="/blog/securing-ai-app-api" className="text-prussian-blue-600 hover:underline">AI-specific API vulnerabilities</Link> for the full picture of how LLM endpoints raise the stakes.
          </p>
          <p>
            <strong>Fix:</strong> Implement rate limiting on all endpoints (per-IP and per-user). Set maximum request body sizes. Implement query complexity limits on GraphQL. Set provider-level spending caps on all AI API accounts. Use <code>X-RateLimit-*</code> headers to communicate limits to clients.
          </p>
          <p>
            <strong>How to check:</strong> ✅ <strong>Scantient checks this automatically.</strong> It probes endpoints for <code>X-RateLimit</code> headers and flags endpoints that accept user input without rate limiting signals as high-severity findings.
          </p>

          <h2>API5:2023 . Broken Function Level Authorization (BFLA)</h2>

          <p>
            <strong>What it is:</strong> Admin or privileged functions are accessible to regular users. The API doesn&apos;t verify that the caller has the permission level required to call the function . only that they&apos;re authenticated.
          </p>
          <p>
            <strong>Fix:</strong> Separate admin endpoints from user endpoints structurally (e.g., <code>/api/admin/*</code> vs <code>/api/*</code>). Implement role-based access control (RBAC) at the middleware or handler level . not just in the frontend. Test every admin function with a regular user account.
          </p>
          <p>
            <strong>How to check:</strong> Requires authenticated testing as a non-admin user. Scantient can detect admin endpoints that don&apos;t return 401/403 on unauthenticated requests, but testing with a regular user role requires session-level access.
          </p>

          <h2>API6:2023 . Unrestricted Access to Sensitive Business Flows</h2>

          <p>
            <strong>What it is:</strong> Business-critical flows (checkout, account creation, vote submission, referral redemption) can be automated and abused at scale because there are no anti-automation controls.
          </p>
          <p>
            <strong>Fix:</strong> Implement CAPTCHA or proof-of-work on flows that should be human-only. Use device fingerprinting and behavioral signals to detect automation. Rate-limit by account, email, or IP on flows that have real business value per request. Monitor for statistical anomalies in high-value flows.
          </p>
          <p>
            <strong>How to check:</strong> Testing requires business context . you need to know which flows are sensitive. Scantient checks for rate limiting signals on detected endpoints, but identifying which flows qualify as &quot;sensitive business flows&quot; requires a manual review of your application&apos;s business logic.
          </p>

          <h2>API7:2023 . Server-Side Request Forgery (SSRF)</h2>

          <p>
            <strong>What it is:</strong> Your API accepts a URL from a user and fetches it server-side . and an attacker supplies an internal network address (<code>http://169.254.169.254/</code>, <code>http://localhost/</code>) to access your internal infrastructure or cloud metadata services.
          </p>
          <p>
            <strong>Why it&apos;s dangerous:</strong> AWS/GCP/Azure metadata endpoints at <code>169.254.169.254</code> return cloud credentials, instance roles, and internal configuration . all accessible from your server if you don&apos;t block SSRF. A successful SSRF attack against a cloud app can lead to full AWS account takeover.
          </p>
          <p>
            <strong>Fix:</strong> Validate and allowlist URLs before fetching them server-side. Block requests to private IP ranges, loopback addresses, and cloud metadata endpoints. Use a URL validation library that handles bypass techniques (IPv6, URL encoding, DNS rebinding). Never forward the raw response from a server-side fetch directly to the user.
          </p>
          <p>
            <strong>How to check:</strong> ✅ <strong>Scantient checks for SSRF exposure patterns</strong> . endpoints that accept URL parameters and reflect content, cloud metadata endpoint accessibility, and internal IP ranges in API responses.
          </p>

          <h2>API8:2023 . Security Misconfiguration</h2>

          <p>
            <strong>What it is:</strong> The API is configured insecurely . missing security headers, permissive CORS, verbose error messages, open debug endpoints, default credentials, or unnecessary HTTP methods enabled.
          </p>
          <p>
            <strong>Fix:</strong> Set all 5 security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy). Lock CORS to specific origins. Return generic error messages . never stack traces in production. Disable debug endpoints before deploying. Disable HTTP methods not in use (<code>TRACE</code>, <code>OPTIONS</code> if not needed).
          </p>
          <p>
            <strong>How to check:</strong> ✅ <strong>Scantient checks this comprehensively and automatically.</strong> Security headers, CORS policy, error verbosity, exposed debug endpoints, HTTP method enumeration . all checked in every scan. This is the most reliably automatable OWASP category, and where most apps fail their first scan.
          </p>

          <h2>API9:2023 . Improper Inventory Management</h2>

          <p>
            <strong>What it is:</strong> Old API versions, undocumented endpoints, and shadow APIs are left running and unmonitored. Attackers discover these endpoints (which often lack current security controls) and exploit them while the team doesn&apos;t even know they&apos;re live.
          </p>
          <p>
            <strong>Why it&apos;s common:</strong> You ship <code>/api/v2/users</code> but forget to disable <code>/api/v1/users</code>. That v1 endpoint was written before your auth refactor and still accepts unauthenticated requests.
          </p>
          <p>
            <strong>Fix:</strong> Maintain an API inventory . every endpoint, every version, its auth requirements and last-updated date. Decommission old API versions with explicit deprecation notices and hard cutoff dates. Use automated scanning to discover endpoints that aren&apos;t in your inventory.
          </p>
          <p>
            <strong>How to check:</strong> ✅ <strong>Scantient crawls your deployed app</strong> and enumerates API routes, including version paths. It flags <code>/v1/</code> endpoints that are still active when <code>/v2/</code> exists, and endpoints that don&apos;t match documented routes.
          </p>

          <h2>API10:2023 . Unsafe Consumption of APIs</h2>

          <p>
            <strong>What it is:</strong> Your application consumes third-party APIs and trusts their responses without validation. If a third-party API is compromised or returns unexpected data, your app processes it blindly . potentially leading to injection attacks, data corruption, or incorrect business logic execution.
          </p>
          <p>
            <strong>Why it matters in 2026:</strong> AI apps are especially exposed here. If your app calls OpenAI, Anthropic, or a data enrichment API and uses the response directly . a supply chain compromise of that API could inject malicious content into your users&apos; responses.
          </p>
          <p>
            <strong>Fix:</strong> Validate all third-party API responses against an explicit schema before using them. Never render raw API responses in your UI without sanitization. Treat third-party API data the same way you treat user input . untrusted until validated. Implement circuit breakers and fallbacks for third-party API failures.
          </p>
          <p>
            <strong>How to check:</strong> ✅ <strong>Scantient checks for third-party API dependencies</strong> in your JavaScript bundle and network requests, and flags dependencies that are loading from CDNs or external origins without subresource integrity (SRI) checks.
          </p>

          <hr />

          <h2>Your 2026 OWASP API Security Checklist</h2>

          <p>
            Use this as your pre-launch audit list:
          </p>

          <div className="not-prose space-y-2">
            {[
              { id: "API1", check: "Object IDs in endpoints have server-side ownership verification", automated: false },
              { id: "API2", check: "Auth endpoints are rate-limited; JWTs have short expiry", automated: false },
              { id: "API3", check: "API responses use explicit output schemas . no raw DB objects returned", automated: true },
              { id: "API4", check: "Rate limiting on all endpoints, especially LLM-backed ones", automated: true },
              { id: "API5", check: "Admin functions require explicit admin role verification", automated: false },
              { id: "API6", check: "High-value business flows have anti-automation controls", automated: false },
              { id: "API7", check: "No user-supplied URLs are fetched server-side without allowlisting", automated: true },
              { id: "API8", check: "All 5 security headers set; CORS locked to specific origins; no verbose errors", automated: true },
              { id: "API9", check: "Old API versions decommissioned; complete endpoint inventory maintained", automated: true },
              { id: "API10", check: "Third-party API responses validated against schema; SRI on CDN assets", automated: true },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border px-4 py-3"
              >
                <span className="mt-0.5 shrink-0 text-xs font-bold text-prussian-blue-600 w-12">{item.id}</span>
                <span className="flex-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">{item.check}</span>
                {item.automated ? (
                  <span className="shrink-0 rounded-full bg-success/10 dark:bg-success/20 border border-success/30 dark:border-success/40 px-2.5 py-0.5 text-xs font-semibold text-success dark:text-success">
                    Auto-checked
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-surface-raised border border-border px-2.5 py-0.5 text-xs font-semibold text-dusty-denim-500">
                    Manual
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6">
            The 7 items marked &ldquo;Auto-checked&rdquo; are verified automatically by Scantient in every external scan. The 3 manual items require authenticated testing or code review . they&apos;re architectural decisions that can&apos;t be verified from outside your app.
          </p>
          <p>
            Start with the 7 automatable items. Most apps fail 3–5 of them on the first scan. Fix those, then work through the architectural items with your code.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Check your OWASP API Security posture in 60 seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            Scantient automatically checks 7 of the 10 OWASP API Security risks from outside your app . no code access, no signup required. See your score instantly.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Run a free OWASP scan →
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-6 py-3 text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
            >
              Get continuous monitoring for $79
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-4">Related</h3>
          <div className="flex flex-col gap-3">
            <Link href="/blog/security-headers-indie-devs" className="text-sm text-prussian-blue-600 hover:underline">
              5 Security Headers Every Indie Dev Should Set (And How to Check Them) →
            </Link>
            <Link href="/blog/7-api-security-mistakes" className="text-sm text-prussian-blue-600 hover:underline">
              7 API Security Mistakes Killing Your Startup →
            </Link>
            <Link href="/blog/securing-ai-app-api" className="text-sm text-prussian-blue-600 hover:underline">
              Securing Your AI App&apos;s API: What to Check Before Launch →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
