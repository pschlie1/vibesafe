import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OAuth 2.0 Security Vulnerabilities Every Developer Should Know (And How to Fix Them) | Scantient Blog",
  description:
    "The most dangerous OAuth 2.0 security vulnerabilities — CSRF attacks, open redirects, authorization code interception, token leakage — explained with practical fixes for each.",
  keywords: "OAuth security vulnerabilities, OAuth 2.0 security issues, OAuth CSRF, OAuth open redirect, authorization code interception, OAuth security best practices",
  openGraph: {
    title: "OAuth 2.0 Security Vulnerabilities Every Developer Should Know (And How to Fix Them)",
    description:
      "OAuth 2.0 security vulnerabilities that developers implement incorrectly: CSRF, open redirects, PKCE bypass, token leakage. With fixes for each.",
    url: "https://scantient.com/blog/oauth-security-vulnerabilities",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-12T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "OAuth 2.0 Security Vulnerabilities Every Developer Should Know (And How to Fix Them)",
    description:
      "OAuth 2.0 is powerful but easy to implement insecurely. CSRF, open redirects, PKCE bypass, token leakage — here's what goes wrong and how to fix it.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "OAuth 2.0 Security Vulnerabilities Every Developer Should Know (And How to Fix Them)",
  description:
    "The most dangerous OAuth 2.0 security vulnerabilities — CSRF, open redirects, authorization code interception, token leakage — with practical fixes.",
  datePublished: "2026-03-12T00:00:00Z",
  dateModified: "2026-03-12T00:00:00Z",
  author: { "@type": "Organization", name: "Scantient" },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/oauth-security-vulnerabilities",
  mainEntityOfPage: "https://scantient.com/blog/oauth-security-vulnerabilities",
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
      name: "OAuth 2.0 Security Vulnerabilities Every Developer Should Know (And How to Fix Them)",
      item: "https://scantient.com/blog/oauth-security-vulnerabilities",
    },
  ],
};

export default function OauthSecurityVulnerabilitiesPage() {
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
              Authentication
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            OAuth 2.0 Security Vulnerabilities Every Developer Should Know (And How to Fix Them)
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            OAuth 2.0 is the backbone of modern API authorization — and one of the most
            frequently misimplemented security protocols in production. These vulnerabilities
            are subtle enough to pass code review and dangerous enough to cause account takeover.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-12">March 12, 2026</time>
            <span>·</span>
            <span>9 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            OAuth 2.0 is not a simple protocol. It&apos;s a framework — deliberately flexible, with
            multiple grant types, optional security parameters, and significant implementation
            responsibility left to developers. That flexibility is also why OAuth implementations
            are a reliable source of high-severity vulnerabilities.
          </p>
          <p>
            These aren&apos;t theoretical attack classes from academic papers. They&apos;re vulnerabilities
            found regularly in production APIs, OAuth libraries, and even well-known identity
            providers. If you&apos;ve implemented OAuth — either as a client or as an authorization
            server — this applies to you.
          </p>

          <h2>Vulnerability 1: Missing State Parameter (CSRF on OAuth Flow)</h2>
          <p>
            The <code>state</code> parameter in OAuth 2.0 exists specifically to prevent CSRF
            attacks against the authorization callback. Without it, an attacker can trick a
            victim&apos;s browser into completing an authorization flow that the attacker initiated —
            linking the victim&apos;s account to the attacker&apos;s identity provider account, or
            completing other account-linking flows.
          </p>
          <p>
            The attack works because OAuth callbacks are predictable HTTP endpoints. If your
            callback handler doesn&apos;t validate a <code>state</code> parameter that was bound to
            the user&apos;s session at authorization initiation, anyone can craft a valid callback URL.
          </p>
          <p>
            <strong>Fix:</strong> Generate a cryptographically random <code>state</code> value
            before redirecting to the authorization server. Store it in the user&apos;s session. On
            callback, verify that the <code>state</code> parameter matches what you stored.
            Reject any callback that doesn&apos;t match.
          </p>

          <h2>Vulnerability 2: Open Redirect in redirect_uri</h2>
          <p>
            The <code>redirect_uri</code> parameter tells the authorization server where to send
            the authorization code after the user approves. If the authorization server doesn&apos;t
            strictly validate this URI against a pre-registered allowlist, an attacker can
            manipulate it to redirect the authorization code to an attacker-controlled server.
          </p>
          <p>
            Common validation failures: prefix matching instead of exact match (allows{" "}
            <code>https://yourapp.com.evil.com/callback</code>), path traversal tolerance (allows{" "}
            <code>https://yourapp.com/callback/../../../attacker</code>), or accepting any subdomain
            (allows <code>https://attacker.yourapp.com/callback</code>).
          </p>
          <p>
            <strong>Fix:</strong> If you&apos;re building an authorization server: require exact match
            redirect URI validation against a pre-registered list. No wildcards. No prefix
            matching. If you&apos;re a client: register the most specific redirect URI possible and
            validate that the authorization code you receive was intended for your application.
          </p>

          <h2>Vulnerability 3: Authorization Code Interception (Missing PKCE)</h2>
          <p>
            PKCE (Proof Key for Code Exchange, pronounced &quot;pixy&quot;) was designed to prevent
            authorization code interception attacks in public clients — native apps and SPAs
            where you can&apos;t safely store a client secret. Without PKCE, if an attacker can
            intercept an authorization code (through a malicious app on the same device, a
            redirect URI misconfiguration, or referrer header leakage), they can exchange it
            for tokens.
          </p>
          <p>
            The OAuth 2.1 draft mandates PKCE for all authorization code flows. Many OAuth
            providers already require it. But plenty of legacy integrations still omit it.
          </p>
          <p>
            <strong>Fix:</strong> Always use PKCE for authorization code flows, even for
            confidential clients. Generate a random <code>code_verifier</code>, hash it to
            create a <code>code_challenge</code>, include the challenge in the authorization
            request, and send the verifier with the token exchange request.
          </p>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Check your API&apos;s authentication configuration
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scantient scans OAuth endpoints and authentication flows from the outside. Free scan, 60 seconds.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>Vulnerability 4: Token Leakage via Referrer Header</h2>
          <p>
            If access tokens or authorization codes are passed as URL query parameters and the
            application subsequently navigates to a third-party resource (analytics script,
            embedded content, external link), the token appears in the <code>Referer</code>{" "}
            header of the outgoing request. The third-party server now has your user&apos;s token.
          </p>
          <p>
            This is why the implicit grant type (which returned tokens in the URL fragment) was
            deprecated. But authorization codes in query parameters have the same problem when
            logging or referrer leakage is present.
          </p>
          <p>
            <strong>Fix:</strong> After processing an authorization code from the URL, immediately
            redirect to a clean URL (remove the <code>code</code> and <code>state</code>{" "}
            parameters). Use <code>Referrer-Policy: no-referrer</code> or{" "}
            <code>origin-when-cross-origin</code> as a defense-in-depth header. Never pass
            access tokens as URL parameters.
          </p>

          <h2>Vulnerability 5: Insufficient Scope Validation</h2>
          <p>
            OAuth scopes define what an access token is authorized to do. If your API doesn&apos;t
            validate that the token&apos;s scopes match what the requested endpoint requires, a token
            issued for read-only access might grant write access, or a token issued for one
            resource might grant access to all resources.
          </p>
          <p>
            This is the OAuth equivalent of broken object-level authorization — it&apos;s one of the{" "}
            <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">
              most common API security mistakes
            </Link>{" "}
            in production systems that use OAuth.
          </p>
          <p>
            <strong>Fix:</strong> Enforce scope checks in every route handler, not just at the
            authentication middleware level. Use a clear scope naming convention. When issuing
            tokens, apply least-privilege — only include scopes the application actually needs.
          </p>

          <h2>Vulnerability 6: Implicit Grant Type Usage</h2>
          <p>
            The implicit grant type was designed for SPAs when cross-origin requests were a
            limitation. It returns access tokens directly in the URL fragment — no code exchange,
            no client secret. It was deprecated in OAuth 2.0 Security Best Current Practice
            (RFC 9700) and should not be used in new implementations.
          </p>
          <p>
            Tokens in URL fragments are accessible to any JavaScript on the page, appear in
            browser history, and are vulnerable to fragment identifier leakage. The authorization
            code flow with PKCE achieves the same goal for SPAs without these risks.
          </p>
          <p>
            <strong>Fix:</strong> Migrate any implicit grant integrations to authorization code
            flow with PKCE. If you&apos;re an authorization server, disable the implicit grant type.
          </p>

          <h2>Vulnerability 7: Client Credential Exposure</h2>
          <p>
            OAuth client secrets in public clients (SPAs, mobile apps) are not secret — they&apos;re
            embedded in code that users can inspect. Using client secrets in these contexts
            provides no security benefit and creates a false sense of security.
          </p>
          <p>
            This also appears as client secrets committed to version control, included in CI
            environment variables with overly broad access, or passed in URL parameters instead
            of the Authorization header. The{" "}
            <Link href="/blog/api-security-complete-guide" className="text-prussian-blue-600 hover:underline">
              full API security guide
            </Link>{" "}
            covers credential management in detail.
          </p>
          <p>
            <strong>Fix:</strong> Don&apos;t use client secrets in public clients — use PKCE instead.
            For confidential clients, pass client credentials via the Authorization header (HTTP
            Basic auth), not as query parameters. Store client secrets with the same rigor as
            any other credential.
          </p>

          <h2>Vulnerability 8: Missing Token Binding / Audience Validation</h2>
          <p>
            Access tokens are often treated as bearer tokens — whoever has the token can use it.
            If a token issued for one API is accepted by another API without audience validation,
            a compromised token for a low-privilege service can be replayed against a
            high-privilege one.
          </p>
          <p>
            JWT access tokens should include an <code>aud</code> (audience) claim specifying the
            intended recipient API. Each API should verify that the token&apos;s audience matches
            its own identifier. Without this, tokens can be reused across services.
          </p>
          <p>
            <strong>Fix:</strong> Include an <code>aud</code> claim in all JWT access tokens.
            Validate the audience claim in every API that accepts tokens. For{" "}
            <Link href="/blog/jwt-security-best-practices" className="text-prussian-blue-600 hover:underline">
              JWT security best practices
            </Link>{" "}
            more broadly, see our dedicated guide.
          </p>

          <h2>OAuth Security Checklist</h2>
          <ul>
            <li>✅ <code>state</code> parameter generated and validated on every authorization flow</li>
            <li>✅ <code>redirect_uri</code> validated with exact match against registered allowlist</li>
            <li>✅ PKCE used for all authorization code flows</li>
            <li>✅ Tokens not passed as URL parameters; referrer policy set</li>
            <li>✅ Scope validation enforced per-endpoint, not just at middleware</li>
            <li>✅ Implicit grant type disabled</li>
            <li>✅ Client secrets not present in public clients</li>
            <li>✅ JWT access tokens include <code>aud</code> claim; audience validated by all APIs</li>
          </ul>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free — 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            External security scan catches authentication issues, misconfigured headers, and exposed endpoints.
            No signup. No SDK.
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
              href="/blog/api-security-complete-guide"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              API Security: The Complete Guide for Developers (2026) →
            </Link>
            <Link
              href="/blog/jwt-security-best-practices"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              JWT Security Best Practices: 8 Mistakes That Expose Your API →
            </Link>
            <Link
              href="/blog/7-api-security-mistakes"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              7 API Security Mistakes Killing Your Startup →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
