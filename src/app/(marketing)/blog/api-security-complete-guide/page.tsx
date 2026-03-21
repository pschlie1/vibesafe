import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Security: The Complete Guide for Developers (2026) | Scantient Blog",
  description:
    "The definitive guide to API security for indie devs and startup CTOs. Covers common threats, authentication best practices, testing tools, and a practical checklist to secure your API before launch.",
  keywords: "API security, how to secure an API, API security best practices, API vulnerability scanner, startup API security",
  openGraph: {
    title: "API Security: The Complete Guide for Developers (2026)",
    description:
      "Everything you need to secure your API: common threats, JWT and OAuth best practices, testing tools, and a practical checklist. Written for indie devs and startup CTOs.",
    url: "https://scantient.com/blog/api-security-complete-guide",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-14T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Security: The Complete Guide for Developers (2026)",
    description:
      "Injection, broken auth, excessive data exposure, rate limiting, CORS — the complete API security guide for developers who ship fast.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "API Security: The Complete Guide for Developers (2026)",
  description:
    "The definitive guide to API security for indie devs and startup CTOs. Covers common threats, authentication best practices, testing tools, and a practical checklist.",
  datePublished: "2026-03-14T00:00:00Z",
  dateModified: "2026-03-21T00:00:00Z",
  author: { "@type": "Organization", name: "Scantient" },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/api-security-complete-guide",
  mainEntityOfPage: "https://scantient.com/blog/api-security-complete-guide",
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
      name: "API Security: The Complete Guide for Developers (2026)",
      item: "https://scantient.com/blog/api-security-complete-guide",
    },
  ],
};

export default function ApiSecurityCompleteGuidePage() {
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
            <span className="rounded-full bg-prussian-blue-100 dark:bg-prussian-blue-900/40 px-2.5 py-0.5 text-xs font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 border border-prussian-blue-200 dark:border-prussian-blue-700">
              API Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            API Security: The Complete Guide for Developers (2026)
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            Your API is the attack surface that matters most. This guide covers every major threat
            category, authentication pattern, and testing strategy — so you can ship fast without
            leaving the door open.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-14">March 14, 2026</time>
            <span>·</span>
            <span>18 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            APIs power every modern application. They&apos;re also the #1 target for attackers. According to
            Cloudflare&apos;s 2024 API Security Report, API-targeted attacks grew 137% year-over-year —
            and the vast majority targeted small and mid-sized companies, not enterprises with large
            security teams.
          </p>
          <p>
            If you&apos;re an indie developer or startup CTO, this guide is for you. We&apos;ll walk through
            every major threat, every authentication pattern, and the practical steps you can take
            today — even before you have a dedicated security team. You can{" "}
            <Link href="/score" className="text-prussian-blue-600 hover:underline">
              scan your API for free right now
            </Link>{" "}
            to see where you stand.
          </p>

          <h2>What Is API Security?</h2>
          <p>
            API security is the set of practices, configurations, and controls that protect your
            application&apos;s programming interfaces from unauthorized access, data exposure, abuse, and
            attack. It covers everything from how you authenticate callers to how you handle
            malformed input to how you configure server response headers.
          </p>
          <p>
            Unlike traditional web application security — which focuses on what users see in a
            browser — API security is about the machine-to-machine layer. Your API doesn&apos;t care what
            the UI looks like. Anyone with <code>curl</code> can hit it directly, bypass your frontend
            entirely, and see exactly what your backend returns.
          </p>
          <p>
            That&apos;s why API security requires an external, attacker&apos;s-eye-view. Running{" "}
            <Link href="/score" className="text-prussian-blue-600 hover:underline">
              an external API scanner
            </Link>{" "}
            against your live app reveals what code review alone cannot.
          </p>

          <h2>Common API Threats You Need to Know</h2>
          <p>
            The OWASP API Security Top 10 is the canonical reference for API threats. Here&apos;s what
            each threat looks like in practice for a startup-scale app.
          </p>

          <h3>1. Injection Attacks</h3>
          <p>
            SQL injection, NoSQL injection, command injection — these attacks happen when untrusted
            user input reaches an interpreter without proper sanitization. In API terms: if your
            endpoint accepts a <code>filter</code> or <code>query</code> parameter and passes it
            directly to a database query, an attacker can manipulate that query to extract, modify,
            or delete data.
          </p>
          <p>
            <strong>The fix:</strong> Use parameterized queries (never string-concatenated SQL), an
            ORM with proper escaping, and input validation on every field before it reaches your
            data layer. Prisma, Drizzle, and TypeORM all handle this correctly by default — as long
            as you don&apos;t use raw query helpers with unescaped input.
          </p>

          <h3>2. Broken Authentication</h3>
          <p>
            Broken authentication is the #1 OWASP API risk. It covers everything from missing auth
            on endpoints to weak token validation to API keys shipped in client-side JavaScript.
          </p>
          <p>
            Common patterns: a developer adds a route during debugging and forgets to protect it; a
            mobile app stores a secret API key in the app bundle; a JWT is accepted without
            verifying its signature. Each is exploitable by a moderately skilled attacker.
          </p>
          <p>
            <strong>The fix:</strong> Every non-public API route must verify a valid token
            server-side. We cover JWT and OAuth patterns in depth below.
          </p>

          <h3>3. Excessive Data Exposure</h3>
          <p>
            Your API returns a full user object. The frontend only displays the name and email. But
            the response also contains the user&apos;s password hash, internal notes, billing status,
            and admin flags — because the developer returned the raw database row and trusted the
            frontend to filter it.
          </p>
          <p>
            This is excessive data exposure. It&apos;s endemic in startups because it&apos;s fast to write
            and invisible until someone intercepts a response in DevTools.
          </p>
          <p>
            <strong>The fix:</strong> Serialize API responses explicitly. Never return raw database
            objects. Define a response schema (DTOs in NestJS, Zod transform in Next.js) and strip
            everything that shouldn&apos;t leave the server.
          </p>

          <h3>4. Missing Rate Limiting</h3>
          <p>
            Without rate limiting, your API is an open invitation to brute-force attacks, credential
            stuffing, enumeration, and DDoS. An attacker can try 10,000 passwords against your
            login endpoint in minutes, or hammer your AI endpoint until your OpenAI bill is five
            figures.
          </p>
          <p>
            <strong>The fix:</strong> Add rate limiting at the edge (Cloudflare, Vercel, AWS WAF)
            and at the application layer. For auth endpoints specifically, implement exponential
            backoff after failed attempts and account lockout after a threshold.
          </p>

          <h3>5. Misconfigured CORS</h3>
          <p>
            CORS (Cross-Origin Resource Sharing) controls which domains can make requests to your
            API from a browser. <code>Access-Control-Allow-Origin: *</code> tells every browser in
            the world that any site can read responses from your API — including responses
            authenticated with your users&apos; cookies.
          </p>
          <p>
            The wildcard is almost always a mistake. Most developers add it to fix a development
            error and forget to tighten it before launch.
          </p>
          <p>
            <strong>The fix:</strong> Lock CORS to an explicit allowlist of origins. In Next.js,
            set this in your API route middleware or <code>next.config.js</code> headers. Never use{" "}
            <code>*</code> with <code>credentials: include</code>.
          </p>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Check your API for all five threat categories — free
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              No signup. No SDK. 60-second external scan.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>Authentication Best Practices</h2>
          <p>
            Authentication is where most startup APIs fail. Let&apos;s look at the three main patterns
            — JWT, OAuth, and API keys — and what to get right with each.
          </p>

          <h3>JWT (JSON Web Tokens)</h3>
          <p>
            JWTs are the most common auth mechanism in modern APIs. A signed token is issued at
            login and sent with every subsequent request. The server verifies the signature without
            hitting a database.
          </p>
          <p>
            <strong>What to get right:</strong>
          </p>
          <ul>
            <li>
              <strong>Always verify the signature.</strong> Never decode and trust a JWT without
              verifying the signature with your secret key. Libraries like{" "}
              <code>jsonwebtoken</code>, <code>jose</code>, and <code>next-auth</code> do this
              correctly — raw base64 decoding does not.
            </li>
            <li>
              <strong>Set short expiry times.</strong> Access tokens should expire in 15–60
              minutes. Use refresh tokens for session persistence.
            </li>
            <li>
              <strong>Never put secrets in the payload.</strong> JWT payloads are base64-encoded,
              not encrypted. Anyone can decode them. Only put non-sensitive identifiers (user ID,
              role) in the payload.
            </li>
            <li>
              <strong>Avoid the <code>none</code> algorithm.</strong> Some JWT libraries accept
              tokens with <code>alg: none</code> — no signature required. Explicitly reject this in
              your validator configuration.
            </li>
          </ul>
          <p>
            For a deeper dive, see our guide:{" "}
            <Link href="/blog/jwt-security-best-practices" className="text-prussian-blue-600 hover:underline">
              JWT Security Best Practices: 8 Mistakes That Expose Your API
            </Link>
            .
          </p>

          <h3>OAuth 2.0</h3>
          <p>
            OAuth 2.0 is the standard for delegated authorization — letting users grant your app
            access to a third-party service (Google, GitHub, Stripe) without sharing their
            password. If you&apos;re building a &quot;Sign in with Google&quot; flow, you&apos;re using OAuth.
          </p>
          <p>
            <strong>What to get right:</strong>
          </p>
          <ul>
            <li>
              Use the <strong>Authorization Code flow with PKCE</strong> for any public client
              (SPAs, mobile apps). Never use the implicit flow for new apps — it&apos;s deprecated.
            </li>
            <li>
              Validate the <code>state</code> parameter on every callback to prevent CSRF attacks.
            </li>
            <li>
              Store tokens server-side or in secure, httpOnly cookies — never in localStorage or
              sessionStorage.
            </li>
            <li>
              Use libraries (<code>next-auth</code>, <code>passport</code>, <code>auth0</code>)
              rather than rolling your own OAuth implementation. The edge cases are subtle and
              consequential.
            </li>
          </ul>

          <h3>API Keys</h3>
          <p>
            API keys are the simplest auth mechanism — a shared secret sent with every request,
            typically in the <code>Authorization</code> header or as a query parameter.
          </p>
          <p>
            <strong>What to get right:</strong>
          </p>
          <ul>
            <li>
              <strong>Never put API keys in client-side code.</strong> This includes{" "}
              <code>NEXT_PUBLIC_</code> variables, mobile app bundles, and any JavaScript that
              ships to a browser. Keys in client code are public keys.
            </li>
            <li>
              <strong>Scope keys to minimum permissions.</strong> An API key for reading user data
              shouldn&apos;t be able to delete accounts. Stripe, GitHub, and most modern platforms
              support fine-grained key permissions — use them.
            </li>
            <li>
              <strong>Rotate keys regularly.</strong> Build rotation into your key management
              workflow. Any key that might have been exposed should be revoked immediately.
            </li>
            <li>
              Store keys in environment variables (<code>.env</code>), a secrets manager (AWS
              Secrets Manager, HashiCorp Vault), or a platform like Doppler. Never commit keys to
              git.
            </li>
          </ul>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Exposed API keys in your live app? Find out in 60 seconds.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>Testing Your API for Security Issues</h2>
          <p>
            Security testing for APIs falls into two categories: code-level analysis (static) and
            runtime testing against a live app (dynamic). You need both.
          </p>

          <h3>Static Analysis (Before Deploy)</h3>
          <p>
            Static analysis scans your source code for known vulnerability patterns — hardcoded
            secrets, insecure dependencies, dangerous function calls. Run it in CI so issues are
            caught before they reach production.
          </p>
          <ul>
            <li>
              <strong>Semgrep</strong> — open-source static analysis with security-focused rulesets
              for Node.js, Python, Go, and more.
            </li>
            <li>
              <strong>Snyk</strong> — dependency vulnerability scanning. Good for catching CVEs in
              your <code>node_modules</code>.
            </li>
            <li>
              <strong>Gitleaks / TruffleHog</strong> — scan git history for committed secrets.
              Run this immediately if you&apos;ve ever accidentally committed credentials.
            </li>
            <li>
              <strong>ESLint security plugins</strong> — <code>eslint-plugin-security</code> adds
              rules that catch common Node.js security anti-patterns at the linting stage.
            </li>
          </ul>

          <h3>Dynamic Analysis (Against Your Live App)</h3>
          <p>
            Dynamic analysis tests your running API from the outside — the same way an attacker
            would. This catches issues that static analysis cannot: misconfigured headers, CORS
            policies, exposed endpoints, SSL problems, and behavior that only appears at runtime.
          </p>
          <ul>
            <li>
              <strong>Scantient</strong> —{" "}
              <Link href="/score" className="text-prussian-blue-600 hover:underline">
                free external scan
              </Link>{" "}
              for headers, CORS, SSL, exposed paths, and API key exposure. Results in 60 seconds,
              no setup.
            </li>
            <li>
              <strong>OWASP ZAP</strong> — open-source DAST scanner. Powerful but requires
              configuration; good for deeper automated testing in CI.
            </li>
            <li>
              <strong>Burp Suite</strong> — the professional standard for manual API penetration
              testing. Use it for focused testing of specific endpoints.
            </li>
            <li>
              <strong>Postman / Insomnia</strong> — not security tools per se, but essential for
              manually probing API behavior: testing auth bypass, parameter manipulation, and
              response content.
            </li>
          </ul>
          <p>
            See also:{" "}
            <Link href="/blog/owasp-top-10-api-checklist" className="text-prussian-blue-600 hover:underline">
              OWASP Top 10 for APIs: A Practical Checklist for 2026
            </Link>
            .
          </p>

          <h2>Security Headers: The 5-Minute Fix with Outsized Impact</h2>
          <p>
            Security headers are one of the highest-ROI security improvements you can make. They&apos;re
            a few lines of configuration that protect against entire categories of attack:
            clickjacking, XSS, protocol downgrade, MIME sniffing, and information leakage.
          </p>
          <ul>
            <li>
              <strong>Strict-Transport-Security (HSTS)</strong> — forces HTTPS for your domain and
              all subdomains. Prevents protocol downgrade attacks.
            </li>
            <li>
              <strong>Content-Security-Policy (CSP)</strong> — controls which scripts, styles, and
              resources can execute in your app. Mitigates XSS.
            </li>
            <li>
              <strong>X-Frame-Options</strong> — prevents your app from being embedded in an
              iframe. Blocks clickjacking.
            </li>
            <li>
              <strong>X-Content-Type-Options</strong> — prevents MIME type sniffing. Set to{" "}
              <code>nosniff</code>.
            </li>
            <li>
              <strong>Referrer-Policy</strong> — controls how much referrer information is sent
              with requests. Set to <code>strict-origin-when-cross-origin</code>.
            </li>
          </ul>
          <p>
            For implementation details:{" "}
            <Link href="/blog/security-headers-indie-devs" className="text-prussian-blue-600 hover:underline">
              5 Security Headers Every Indie Dev Should Set (And How to Check Them)
            </Link>
            .
          </p>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Missing security headers? Check all 5 in 60 seconds.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>AI APIs Need Extra Security Attention</h2>
          <p>
            If your app calls OpenAI, Anthropic, or a custom LLM, you have additional attack
            vectors that traditional API security doesn&apos;t cover. Prompt injection — where malicious
            user input hijacks your LLM&apos;s behavior — is now the AI equivalent of SQL injection.
          </p>
          <p>
            Key considerations for AI APIs:
          </p>
          <ul>
            <li>Never embed your OpenAI API key in client-side code</li>
            <li>Validate and sanitize all user input before passing it to an LLM prompt</li>
            <li>Rate limit AI endpoints aggressively — they&apos;re expensive to abuse</li>
            <li>Treat LLM output as untrusted input before rendering it in your UI</li>
          </ul>
          <p>
            Full guide:{" "}
            <Link href="/blog/securing-ai-app-api" className="text-prussian-blue-600 hover:underline">
              Securing Your AI App&apos;s API: What to Check Before Launch
            </Link>
            .
          </p>

          <h2>API Security Mistakes Developers Make in Production</h2>
          <p>
            The most common API security failures we&apos;ve seen in real startup scans:
          </p>
          <ul>
            <li>API keys in client-side JavaScript bundles</li>
            <li>CORS set to <code>*</code> from a development debugging session</li>
            <li>Auth checks only in frontend components, not API routes</li>
            <li>Debug endpoints left exposed in production (<code>/api/admin</code>, <code>/.env</code>)</li>
            <li>Missing or misconfigured security headers</li>
            <li>SSL certificates about to expire (or expired)</li>
            <li>Rate limiting skipped because &quot;we don&apos;t have many users yet&quot;</li>
          </ul>
          <p>
            Read the full breakdown:{" "}
            <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">
              7 API Security Mistakes Killing Your Startup
            </Link>
            .
          </p>

          <h2>The API Security Checklist</h2>
          <p>
            Run through this before launch — and re-run it every time you add a significant new
            endpoint or feature.
          </p>

          <h3>Authentication &amp; Authorization</h3>
          <ul>
            <li>✅ All non-public API routes verify auth server-side</li>
            <li>✅ JWTs: signature verified, short expiry, no secrets in payload, <code>none</code> algorithm rejected</li>
            <li>✅ API keys: stored server-side only, scoped to minimum permissions, not in git</li>
            <li>✅ OAuth: PKCE for public clients, <code>state</code> parameter validated</li>
            <li>✅ No hardcoded credentials in source code or environment files committed to git</li>
          </ul>

          <h3>Transport &amp; Headers</h3>
          <ul>
            <li>✅ HTTPS enforced everywhere (HSTS header set)</li>
            <li>✅ SSL certificate valid and monitored</li>
            <li>✅ Content-Security-Policy configured</li>
            <li>✅ X-Frame-Options set to <code>DENY</code> or <code>SAMEORIGIN</code></li>
            <li>✅ X-Content-Type-Options: <code>nosniff</code></li>
            <li>✅ Referrer-Policy configured</li>
          </ul>

          <h3>CORS &amp; Access Control</h3>
          <ul>
            <li>✅ CORS locked to specific origin allowlist (no <code>*</code> with credentials)</li>
            <li>✅ Methods and headers explicitly allowed, not wildcarded</li>
            <li>✅ Preflight requests handled correctly</li>
          </ul>

          <h3>Input Validation &amp; Data Handling</h3>
          <ul>
            <li>✅ All input validated with a schema (Zod, Joi, class-validator)</li>
            <li>✅ Parameterized queries everywhere — no string-concatenated SQL</li>
            <li>✅ API responses serialized explicitly — no raw database objects returned</li>
            <li>✅ Error messages don&apos;t leak stack traces or internal details</li>
          </ul>

          <h3>Rate Limiting &amp; Availability</h3>
          <ul>
            <li>✅ Rate limiting on all public endpoints</li>
            <li>✅ Stricter limits on auth endpoints (login, password reset, OTP)</li>
            <li>✅ AI/LLM endpoints rate limited separately</li>
          </ul>

          <h3>Exposed Endpoints &amp; Operational Security</h3>
          <ul>
            <li>✅ No debug endpoints in production (<code>/api/debug</code>, <code>/.env</code>, <code>/.git</code>)</li>
            <li>✅ Health check endpoints don&apos;t expose configuration or environment details</li>
            <li>✅ Dependencies up to date; no known CVEs in production packages</li>
          </ul>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Don&apos;t check the list manually — scan your API in 60 seconds
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scantient checks headers, CORS, SSL, exposed paths, and API key exposure automatically.
              No signup. No SDK. Free.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free — Results in 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            External security scan: headers, CORS, SSL, exposed endpoints, API key exposure. No signup. No SDK.
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
          <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-4">
            Go deeper
          </h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/blog/7-api-security-mistakes"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              7 API Security Mistakes Killing Your Startup →
            </Link>
            <Link
              href="/blog/owasp-top-10-api-checklist"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              OWASP Top 10 for APIs: A Practical Checklist for 2026 →
            </Link>
            <Link
              href="/blog/security-headers-indie-devs"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              5 Security Headers Every Indie Dev Should Set →
            </Link>
            <Link
              href="/blog/securing-ai-app-api"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Securing Your AI App&apos;s API: What to Check Before Launch →
            </Link>
            <Link
              href="/blog/jwt-security-best-practices"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              JWT Security Best Practices: 8 Mistakes That Expose Your API →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
