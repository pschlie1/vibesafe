import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SaaS Launch Security Checklist: 15 Things to Check Before Going Live | Scantient Blog",
  description:
    "The pre-launch security checklist for SaaS founders and indie devs. 15 security items to verify before your first user signs up . from SSL to CORS to rate limiting to API key exposure.",
  keywords: "SaaS security checklist, pre-launch security audit, startup security before launch, SaaS launch checklist, API security checklist",
  openGraph: {
    title: "SaaS Launch Security Checklist: 15 Things to Check Before Going Live",
    description:
      "15 security items to verify before your SaaS goes live. SSL, headers, CORS, auth, rate limiting, secrets . everything a startup needs to check before the first user arrives.",
    url: "https://scantient.com/blog/saas-launch-security-checklist",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-21T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Launch Security Checklist: 15 Things to Check Before Going Live",
    description:
      "15 security items every SaaS founder should check before launch. Catch the obvious issues before attackers do.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "SaaS Launch Security Checklist: 15 Things to Check Before Going Live",
  description:
    "The pre-launch security checklist for SaaS founders and indie devs. 15 security items to verify before your first user signs up.",
  datePublished: "2026-03-21T00:00:00Z",
  dateModified: "2026-03-21T00:00:00Z",
  author: { "@type": "Organization", name: "Scantient" },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/saas-launch-security-checklist",
  mainEntityOfPage: "https://scantient.com/blog/saas-launch-security-checklist",
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
      name: "SaaS Launch Security Checklist: 15 Things to Check Before Going Live",
      item: "https://scantient.com/blog/saas-launch-security-checklist",
    },
  ],
};

export default function SaasLaunchSecurityChecklistPage() {
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
              Checklist
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            SaaS Launch Security Checklist: 15 Things to Check Before Going Live
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            You&apos;re about to announce your launch. Your app works. Your landing page is live. But
            have you actually checked whether your app is secure enough to accept real users and
            real data? Here are the 15 things to verify before you ship.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-21">March 21, 2026</time>
            <span>·</span>
            <span>11 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            New domains get probed by automated scanners within hours of DNS registration. Your
            app doesn&apos;t need to be famous to be targeted . it just needs to be on the internet.
            The good news: the most critical pre-launch security checks take less time than writing
            your Product Hunt description.
          </p>
          <p>
            This checklist covers the 15 most important items. Some take 30 seconds to verify.
            A few require code changes. All of them matter before your first user signs up.
          </p>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Run an external security scan before you launch
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scantient checks 8 of these 15 items automatically. 60 seconds. No signup.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>SSL &amp; Transport Security</h2>

          <h3>✅ 1. SSL Certificate Is Valid and Not Expiring Soon</h3>
          <p>
            Check your certificate&apos;s expiry date right now. Most hosting platforms (Vercel,
            Netlify, Railway) handle Let&apos;s Encrypt auto-renewal . but managed certificates and
            custom domain setups can and do expire. A common scenario: you set up your custom
            domain, the certificate was issued, and it expires 90 days later. If auto-renewal
            failed silently, users see a browser security warning on your launch day.
          </p>
          <p>
            <strong>How to check:</strong> Click the lock icon in Chrome → Certificate → Expiry.
            Or use <code>openssl s_client -connect yourapp.com:443 2&gt;/dev/null | openssl x509 -noout -dates</code>.
            Or let Scantient check it automatically with a free scan.
          </p>

          <h3>✅ 2. HTTP Redirects to HTTPS (No Mixed Content)</h3>
          <p>
            Test that <code>http://yourapp.com</code> redirects to{" "}
            <code>https://yourapp.com</code>. Then open DevTools → Console and check for mixed
            content warnings (HTTP resources loaded on an HTTPS page). Mixed content triggers
            browser warnings and can undermine the security of your HTTPS connection.
          </p>

          <h3>✅ 3. HSTS Header Set</h3>
          <p>
            The <code>Strict-Transport-Security</code> header tells browsers to always use HTTPS
            for your domain, even if a user types <code>http://</code>. Without it, a user on a
            shared network can be downgraded to HTTP on their first visit (before the redirect).
          </p>
          <p>
            Minimum: <code>Strict-Transport-Security: max-age=31536000; includeSubDomains</code>
          </p>

          <h2>Security Headers</h2>

          <h3>✅ 4. Content-Security-Policy (CSP) Configured</h3>
          <p>
            CSP is the primary defense against XSS attacks. It tells the browser which scripts,
            styles, images, and other resources are allowed to load on your page. A permissive
            CSP is better than none; a strict CSP provides meaningful protection. At minimum, set
            a CSP that disallows <code>unsafe-eval</code> and restricts script sources.
          </p>
          <p>
            In Next.js, configure CSP in <code>next.config.js</code> headers. In Express, use{" "}
            <code>helmet()</code>.
          </p>

          <h3>✅ 5. X-Frame-Options Set</h3>
          <p>
            Without <code>X-Frame-Options: DENY</code> or <code>SAMEORIGIN</code>, your app can
            be embedded in an iframe on any site. Attackers use this for clickjacking . overlaying
            invisible buttons on your app to trick users into clicking things they didn&apos;t intend
            to. One line of config, zero cost, eliminates the entire attack surface.
          </p>

          <h3>✅ 6. X-Content-Type-Options: nosniff</h3>
          <p>
            This header prevents browsers from MIME-sniffing responses away from the declared
            Content-Type. Without it, a browser might interpret a user-uploaded file as executable
            JavaScript. Set it to <code>nosniff</code> and forget about it.
          </p>

          <h3>✅ 7. Referrer-Policy Set</h3>
          <p>
            Controls how much URL information is sent in the <code>Referer</code> header when
            users navigate away from your site. Without a policy, full URLs (including query
            parameters, which may contain tokens or sensitive data) can be leaked to external
            sites. Set <code>strict-origin-when-cross-origin</code> as a safe default.
          </p>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Check all 4 security headers with one free scan
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>API &amp; Authentication Security</h2>

          <h3>✅ 8. No API Keys Exposed in Client-Side Code</h3>
          <p>
            This is the #1 mistake in startup apps built with AI coding assistants. Search your
            entire codebase (including generated code) for any <code>NEXT_PUBLIC_</code> variables
            that contain secret values, and for any API keys or tokens hardcoded in JavaScript
            files that ship to the browser.
          </p>
          <p>
            Check your deployed JavaScript bundle: open DevTools → Sources → search for known key
            prefixes (<code>sk-</code> for OpenAI, <code>pk_</code> for Stripe, etc.).
          </p>

          <h3>✅ 9. All Auth-Protected Routes Verify Auth Server-Side</h3>
          <p>
            For every API route that returns user-specific or sensitive data, verify that the auth
            check happens server-side . not just in the frontend component. Test this manually
            with <code>curl</code>: call your API routes without any auth headers or cookies.
            If they return data, your auth is frontend-only.
          </p>

          <h3>✅ 10. CORS Locked to Specific Origins</h3>
          <p>
            Test your CORS policy by sending a request with an <code>Origin</code> header from a
            domain that shouldn&apos;t have access:
          </p>
          <pre><code>curl -H "Origin: https://evil.com" -I https://yourapp.com/api/users</code></pre>
          <p>
            If the response contains{" "}
            <code>Access-Control-Allow-Origin: https://evil.com</code> or{" "}
            <code>Access-Control-Allow-Origin: *</code>, your CORS policy is too permissive.
          </p>

          <h3>✅ 11. Rate Limiting on Auth Endpoints</h3>
          <p>
            Your login, password reset, and OTP endpoints are targets for brute-force and
            credential stuffing attacks. Test that repeated failed requests result in rate
            limiting or lockout. Implement exponential backoff after failed attempts. At Vercel
            scale, you can handle this at the edge with Vercel&apos;s WAF or an inline middleware.
          </p>

          <h2>Data &amp; Information Exposure</h2>

          <h3>✅ 12. No Sensitive Endpoints Exposed</h3>
          <p>
            Test for common dangerous paths that attackers probe automatically:
          </p>
          <ul>
            <li><code>/.env</code> . environment variables</li>
            <li><code>/.git/HEAD</code> . git repository access</li>
            <li><code>/api/admin</code>, <code>/admin</code> . admin panels</li>
            <li><code>/phpinfo.php</code> . PHP configuration</li>
            <li><code>/actuator/health</code>, <code>/actuator/env</code> . Spring Boot actuators</li>
          </ul>
          <p>
            Each should return 404 (not 403 . 403 confirms the path exists). Scantient checks all
            of these automatically in a free scan.
          </p>

          <h3>✅ 13. Error Messages Don&apos;t Leak Internal Details</h3>
          <p>
            Trigger an error in your API (bad request, missing param, invalid ID) and examine the
            response. It should return a user-friendly error message and a status code . not a
            stack trace, database error message, ORM query, or internal file path.
          </p>
          <p>
            In Next.js, make sure you&apos;re not returning caught errors directly:{" "}
            <code>return NextResponse.json({"{ error: 'Internal server error' }"}, {"{ status: 500 }"})</code>{" "}
            . not <code>return NextResponse.json(error)</code>.
          </p>

          <h2>Dependencies &amp; Supply Chain</h2>

          <h3>✅ 14. No Known Critical CVEs in Dependencies</h3>
          <p>
            Run <code>npm audit</code> (or your package manager&apos;s equivalent) and check for
            critical or high-severity vulnerabilities. You don&apos;t need to fix every low-severity
            finding before launch . but critical CVEs in dependencies you actively use should be
            addressed.
          </p>
          <p>
            For automated ongoing scanning, Snyk and Dependabot are both free for small projects
            and run in GitHub Actions.
          </p>

          <h3>✅ 15. No Secrets Committed to Git</h3>
          <p>
            Run a secrets scan against your entire git history before your first public launch.
            Secrets committed and then deleted are still in git history . visible to anyone who
            clones your repo if it&apos;s ever made public, and visible to everyone right now if the
            repo is already public.
          </p>
          <p>
            Quick scan: <code>npx trufflehog git file://. --only-verified</code>. If it finds
            anything, rotate the exposed credentials immediately . then remove them from git
            history with <code>git filter-repo</code>.
          </p>

          <h2>The 60-Second Shortcut</h2>
          <p>
            Items 1–3 (SSL), 4–7 (headers), 8 (API key exposure), 10 (CORS), and 12 (exposed
            endpoints) can all be checked in a single 60-second external scan. Paste your URL into{" "}
            <Link href="/score" className="text-prussian-blue-600 hover:underline">
              Scantient&apos;s free scanner
            </Link>{" "}
            and get a security score covering all of them . before you announce your launch.
          </p>
          <p>
            Items 9, 11, 13, 14, and 15 require a few minutes of manual testing or your CI
            pipeline. Do them in parallel while the scan runs.
          </p>

          <h2>Quick Reference: Pre-Launch Security Checklist</h2>

          <p><strong>SSL &amp; Transport</strong></p>
          <ul>
            <li>✅ 1. SSL certificate valid, not expiring within 30 days</li>
            <li>✅ 2. HTTP redirects to HTTPS, no mixed content</li>
            <li>✅ 3. HSTS header configured</li>
          </ul>

          <p><strong>Security Headers</strong></p>
          <ul>
            <li>✅ 4. Content-Security-Policy set</li>
            <li>✅ 5. X-Frame-Options: DENY or SAMEORIGIN</li>
            <li>✅ 6. X-Content-Type-Options: nosniff</li>
            <li>✅ 7. Referrer-Policy configured</li>
          </ul>

          <p><strong>API &amp; Auth</strong></p>
          <ul>
            <li>✅ 8. No API keys in client-side code or NEXT_PUBLIC_ variables</li>
            <li>✅ 9. All protected routes verify auth server-side</li>
            <li>✅ 10. CORS locked to specific origin allowlist</li>
            <li>✅ 11. Rate limiting on auth endpoints</li>
          </ul>

          <p><strong>Data Exposure</strong></p>
          <ul>
            <li>✅ 12. No sensitive paths exposed (/.env, /.git, /admin, actuators)</li>
            <li>✅ 13. Error messages don&apos;t leak stack traces or internal details</li>
          </ul>

          <p><strong>Dependencies &amp; Secrets</strong></p>
          <ul>
            <li>✅ 14. No critical CVEs in production dependencies (npm audit)</li>
            <li>✅ 15. No secrets in git history (TruffleHog scan)</li>
          </ul>

          <p>
            For more checklists tailored to your stage, see our{" "}
            <Link href="/security-checklist" className="text-prussian-blue-600 hover:underline">
              security checklist overview
            </Link>
            , our{" "}
            <Link href="/blog/post-deploy-security-checklist" className="text-prussian-blue-600 hover:underline">
              post-deploy security checklist
            </Link>
            , and the{" "}
            <Link href="/blog/indie-dev-security-checklist" className="text-prussian-blue-600 hover:underline">
              indie dev security checklist
            </Link>
            .
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Before You Launch . Free
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            External security scan covering SSL, headers, CORS, exposed endpoints, and API key exposure. 60 seconds. No signup.
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
              href="/security-checklist"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              The IT Director&apos;s Security Checklist for AI-Built Apps →
            </Link>
            <Link
              href="/blog/post-deploy-security-checklist"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Your Deploy Just Went Live. Now Run This Security Checklist. →
            </Link>
            <Link
              href="/blog/indie-dev-security-checklist"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              The Indie Dev Security Checklist: Ship Fast Without Getting Hacked →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
