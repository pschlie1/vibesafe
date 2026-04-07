import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "5 Security Headers Every Indie Dev Should Set (And How to Check Them) | Scantient Blog",
  description:
    "A practical guide to the 5 HTTP security headers every web app needs: Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, and Referrer-Policy. What each does, the one-liner to add it, and what happens without it.",
  keywords: "security headers, check security headers, HTTP security headers guide, Content-Security-Policy, X-Frame-Options, HSTS, web security headers",
  openGraph: {
    title: "5 Security Headers Every Indie Dev Should Set (And How to Check Them)",
    description:
      "CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy . what each does, the one-liner to add it, and what happens if you skip it. Check all 5 in 60 seconds.",
    url: "https://scantient.com/blog/security-headers-indie-devs",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-05T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "5 Security Headers Every Indie Dev Should Set (And How to Check Them)",
    description:
      "The 5 HTTP security headers your app probably doesn't have . and the one-liner to add each. Check all 5 in 60 seconds with Scantient.",
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
      name: "5 Security Headers Every Indie Dev Should Set",
      item: "https://scantient.com/blog/security-headers-indie-devs",
    },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "5 Security Headers Every Indie Dev Should Set (And How to Check Them)",
  description:
    "A practical guide to the 5 HTTP security headers every web app needs . what each does, the one-liner to add it, and what happens without it.",
  datePublished: "2026-03-05T00:00:00Z",
  publisher: { "@type": "Organization", name: "Scantient", url: "https://scantient.com" },
  mainEntityOfPage: "https://scantient.com/blog/security-headers-indie-devs",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".article-lede"],
  },
};

export default function SecurityHeadersIndieDevsPage() {
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
      "name": "What are security headers and why do they matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Security headers are HTTP response headers that instruct browsers on how to handle your content securely. They protect against XSS, clickjacking, content sniffing, and other client-side attacks. Missing security headers are a common finding in security audits."
      }
    },
    {
      "@type": "Question",
      "name": "Which security headers should every web app have?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "At minimum: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options (or frame-ancestors CSP directive), Referrer-Policy, and Strict-Transport-Security. These cover the most common browser-level attack vectors."
      }
    },
    {
      "@type": "Question",
      "name": "How do I check if my app has the right security headers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scantient checks for security headers as part of its API security scan. You can also use securityheaders.com to check any public URL manually. Aim for an A rating and address any missing headers before launch."
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
              Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            5 Security Headers Every Indie Dev Should Set (And How to Check Them)
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400 article-lede">
            Security headers are free. They take 5 minutes to add. And most indie dev projects ship without a single one. Here are the 5 that matter, what each one does, and how to verify they&apos;re actually working.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-05">March 5, 2026</time>
            <span>·</span>
            <span>8 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            Most web app security vulnerabilities require sophisticated attacks . SQL injection, XSS, CSRF, token theft. Security headers are different: they&apos;re not a defense against sophisticated attacks. They&apos;re a defense against browsers doing things they shouldn&apos;t do by default.
          </p>
          <p>
            Every major browser respects these headers. Setting them takes 5 minutes. And if your app gets security-scanned, missing headers are the first thing the report lists . because they&apos;re easy to find, easy to fix, and embarrassingly common to miss.
          </p>
          <p>
            Here are the 5 you need. For each: what it does, what happens without it, and the exact line to add it.
          </p>

          <hr />

          <h2>1. Content-Security-Policy (CSP)</h2>

          <p>
            <strong>What it does:</strong> CSP tells browsers which sources are allowed to load scripts, styles, images, fonts, and other resources on your page. It&apos;s the primary defense against Cross-Site Scripting (XSS) attacks.
          </p>
          <p>
            <strong>What happens without it:</strong> If an attacker manages to inject a <code>&lt;script&gt;</code> tag into your page . through a user-generated content field, a third-party library vulnerability, or a compromised CDN . the browser executes it without question. With no CSP, browsers will happily run any script from any origin.
          </p>
          <p>
            A real-world example: an indie dev uses a third-party comment widget that gets compromised. The widget starts serving a cryptominer script. Without CSP, every visitor&apos;s browser runs it. With CSP, the browser blocks any script not explicitly allowed.
          </p>
          <p>
            <strong>The one-liner (Next.js . add to <code>next.config.js</code> headers or middleware):</strong>
          </p>
          <pre><code>{`Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:`}</code></pre>
          <p>
            This is a moderate starting policy. For tighter security, remove <code>&apos;unsafe-inline&apos;</code> from script-src and use nonces (Next.js middleware makes this easy). Start with the above; tighten it after you verify nothing breaks.
          </p>
          <p>
            <strong>Verification:</strong> Open DevTools → Network → reload → click your HTML document → Response Headers. Look for <code>Content-Security-Policy</code>. Or run a{" "}
            <Link href="/score" className="text-prussian-blue-600 hover:underline">free Scantient scan</Link> . it checks CSP presence and reports the policy value.
          </p>

          <hr />

          <h2>2. X-Frame-Options</h2>

          <p>
            <strong>What it does:</strong> Prevents your app from being embedded in an <code>&lt;iframe&gt;</code> on another website. This is the primary defense against clickjacking attacks.
          </p>
          <p>
            <strong>What happens without it:</strong> An attacker creates a transparent iframe overlaying your app on their malicious website. The user thinks they&apos;re clicking a button on the attacker&apos;s page . they&apos;re actually clicking a button on your app. This has been used to steal OAuth tokens, trigger purchases, and execute account actions without user consent.
          </p>
          <p>
            Clickjacking is old, but it&apos;s still in the wild because it&apos;s easy to execute and most indie apps don&apos;t need to be embeddable anywhere.
          </p>
          <p>
            <strong>The one-liner:</strong>
          </p>
          <pre><code>X-Frame-Options: DENY</code></pre>
          <p>
            Use <code>DENY</code> unless you specifically need your app to be embeddable in iframes from trusted origins (in which case use <code>SAMEORIGIN</code> or the newer CSP <code>frame-ancestors</code> directive). Most indie apps should use <code>DENY</code>.
          </p>
          <p>
            <strong>Verification:</strong> Same as above . Response Headers in DevTools, or Scantient flags missing <code>X-Frame-Options</code> as a medium-severity finding.
          </p>

          <hr />

          <h2>3. Strict-Transport-Security (HSTS)</h2>

          <p>
            <strong>What it does:</strong> Tells browsers to always use HTTPS for your domain . even if a user types <code>http://</code> or clicks an old HTTP link. Once a browser sees this header, it upgrades all future requests to HTTPS automatically for the duration you specify.
          </p>
          <p>
            <strong>What happens without it:</strong> Your app is vulnerable to SSL stripping attacks. An attacker on the same network intercepts the initial HTTP request before it can redirect to HTTPS, and serves a fake version of your site over plain HTTP. Your users never see the HTTPS redirect . they&apos;re talking to the attacker the whole time.
          </p>
          <p>
            If you&apos;re already on HTTPS (and you should be . Vercel and Netlify give you this for free), HSTS is the final piece that ensures users can&apos;t be downgraded.
          </p>
          <p>
            <strong>The one-liner:</strong>
          </p>
          <pre><code>Strict-Transport-Security: max-age=31536000; includeSubDomains</code></pre>
          <p>
            <code>max-age=31536000</code> is one year . the browser remembers to always use HTTPS for your domain for that long. <code>includeSubDomains</code> applies it to all subdomains. Add <code>preload</code> when you&apos;re confident your entire domain and all subdomains are on HTTPS permanently.
          </p>
          <p>
            <strong>Note:</strong> Only send HSTS over HTTPS . never over HTTP. Your hosting provider likely handles this automatically if you configure it in headers.
          </p>

          <hr />

          <h2>4. X-Content-Type-Options</h2>

          <p>
            <strong>What it does:</strong> Stops browsers from &quot;sniffing&quot; MIME types. Without it, browsers may guess what type a resource is and execute it as code even if your server says it&apos;s something else.
          </p>
          <p>
            <strong>What happens without it:</strong> Say a user uploads a file to your app. Your server saves it as <code>application/octet-stream</code>. A malicious user uploads an HTML file and tricks a victim into loading the URL. Without this header, some browsers sniff the content, decide it looks like HTML, and render it as a webpage . potentially executing embedded scripts. This is a MIME confusion attack.
          </p>
          <p>
            It&apos;s also relevant for JSON API responses . a misconfigured server might accidentally serve JSON with a content type that a browser decides to execute.
          </p>
          <p>
            <strong>The one-liner:</strong>
          </p>
          <pre><code>X-Content-Type-Options: nosniff</code></pre>
          <p>
            That&apos;s the entire header. One value, no options. Every app should have this. It takes 10 seconds to add and there&apos;s no downside.
          </p>

          <hr />

          <h2>5. Referrer-Policy</h2>

          <p>
            <strong>What it does:</strong> Controls how much information about the source URL is included in the <code>Referer</code> header when users navigate from your site to external links. By default, browsers send the full URL . including query parameters . as the referrer.
          </p>
          <p>
            <strong>What happens without it:</strong> A user visits <code>https://yourapp.com/reset-password?token=abc123</code> and clicks an external link. The destination site receives that full URL in its server logs, including the password reset token. This is a real data leak vector . not theoretical.
          </p>
          <p>
            The same applies to search query parameters, session identifiers in URLs, user IDs, and any other sensitive data that ends up in URLs (which it shouldn&apos;t, but often does).
          </p>
          <p>
            <strong>The one-liner:</strong>
          </p>
          <pre><code>Referrer-Policy: strict-origin-when-cross-origin</code></pre>
          <p>
            This sends the origin (scheme + domain, no path or query) when navigating cross-origin, and the full URL for same-origin navigation. It&apos;s the sensible default that preserves analytics (cross-origin navigation still sends your domain as referrer) while preventing URL parameter leakage.
          </p>

          <hr />

          <h2>How to Add All 5 in Next.js (One Block)</h2>

          <p>
            If you&apos;re using Next.js, add these to your <code>next.config.js</code>:
          </p>
          <pre><code>{`// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};`}</code></pre>
          <p>
            For other frameworks: add these as response headers in your server config (Nginx, Express, Vercel <code>vercel.json</code>, Cloudflare Workers, etc.). The header values are identical . only the configuration syntax differs.
          </p>

          <h2>Check All 5 in 60 Seconds</h2>

          <p>
            You can verify these headers manually using browser DevTools (Network tab → select your HTML document → Response Headers). But that&apos;s tedious and error-prone . especially if you want to check every route, not just the homepage.
          </p>
          <p>
            Scantient checks all 5 security headers as part of its external security scan. It also checks CORS, API key exposure, rate limiting, and 20+ other signals. For a deployed app, you want to know what the internet actually sees . not what your config file says.
          </p>
          <p>
            Run a <Link href="/score" className="text-prussian-blue-600 hover:underline">free scan on your app</Link> and you&apos;ll know in 60 seconds exactly which headers are missing, which are misconfigured, and what to do about each one. No signup required.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Check all 5 security headers in 60 seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            No signup. No code access. Paste your URL and get an instant security header report . plus API key exposure, CORS, rate limiting, and more.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Check my security headers →
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-6 py-3 text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
            >
              Get continuous monitoring
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-4">Related</h3>
          <div className="flex flex-col gap-3">
            <Link href="/blog/owasp-top-10-api-checklist" className="text-sm text-prussian-blue-600 hover:underline">
              OWASP Top 10 for APIs: A Practical Checklist for 2026 →
            </Link>
            <Link href="/blog/indie-dev-security-checklist" className="text-sm text-prussian-blue-600 hover:underline">
              The Indie Dev Security Checklist: Ship Fast Without Getting Hacked →
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
