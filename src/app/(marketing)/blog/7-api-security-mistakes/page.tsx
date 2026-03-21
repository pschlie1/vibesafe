import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "7 API Security Mistakes Killing Your Startup | Scantient Blog",
  description:
    "The most common API security mistakes indie developers make — and what to do instead. A practical startup security checklist with real examples and how an api vulnerability scanner catches each one.",
  keywords: "indie dev security, startup security checklist, api vulnerability scanner, api security mistakes, startup api security",
  openGraph: {
    title: "7 API Security Mistakes Killing Your Startup",
    description:
      "The most common API security mistakes indie developers make — and what to do instead. Real examples, fixes, and how Scantient catches each one.",
    url: "https://scantient.com/blog/7-api-security-mistakes",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-21T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "7 API Security Mistakes Killing Your Startup",
    description:
      "Common API security mistakes, what they cost you, and a practical startup security checklist to fix them fast.",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://scantient.com/blog" },
    { "@type": "ListItem", position: 3, name: "7 API Security Mistakes Killing Your Startup", item: "https://scantient.com/blog/7-api-security-mistakes" },
  ],
};

export default function SevenApiSecurityMistakesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/blog" className="text-sm text-dusty-denim-600 hover:text-prussian-blue-600 transition-colors">
            ← Blog
          </Link>
          <span className="text-sm text-dusty-denim-400">/</span>
          <span className="rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error border border-error/20">
            Security
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
          7 API Security Mistakes Killing Your Startup
        </h1>
        <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
          You shipped fast. That&apos;s the point. But these seven mistakes are sitting in your production API right now — and any one of them is enough to lose a customer, fail a compliance audit, or end up on HackerNews for the wrong reason.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
          <time dateTime="2026-03-21">March 21, 2026</time>
          <span>·</span>
          <span>9 min read</span>
        </div>
      </div>

      {/* Body */}
      <div className="prose prose-slate dark:prose-invert max-w-none">

        <p>
          Most security breaches don&apos;t happen because a genius attacker found a zero-day. They happen because someone left the door unlocked. For APIs, &quot;leaving the door unlocked&quot; looks like a missing header, a hardcoded key, or a CORS policy that says &quot;yes&quot; to everyone.
        </p>
        <p>
          Here are the seven API security mistakes we see most often when running an <Link href="/score" className="text-prussian-blue-600 hover:underline">api vulnerability scanner</Link> against real startup apps — plus what to do about each one.
        </p>

        <h2>1. Exposing API Keys in Client-Side JavaScript</h2>
        <p>
          <strong>What it looks like:</strong> You&apos;re building a React or Next.js app. You need to call Stripe, OpenAI, or Supabase from the frontend. So you set <code>NEXT_PUBLIC_STRIPE_SECRET_KEY</code> in your environment and it works. You ship.
        </p>
        <p>
          <strong>What actually happened:</strong> Every user who opens DevTools → Network → any API call can now read your Stripe secret key. In a real incident Scantient found during a beta scan, a founder had left $50K worth of live Stripe credentials in their JavaScript bundle — publicly readable, no auth required.
        </p>
        <p>
          <strong>What to do instead:</strong> Secret keys stay on the server. Use server-side API routes (Next.js API routes, Express endpoints) to proxy calls that require secret credentials. <code>NEXT_PUBLIC_</code> variables are for client-safe config only: analytics IDs, public Stripe publishable keys, feature flags.
        </p>
        <p>
          <strong>How Scantient catches it:</strong> We scan your JavaScript bundles and API responses for patterns matching 20+ known API key formats (OpenAI, Stripe, Supabase, AWS, Twilio, SendGrid, and more). If a key is visible in client-side code, we flag it immediately.
        </p>

        <h2>2. Missing Security Headers (Your App Is Basically Open)</h2>
        <p>
          <strong>What it looks like:</strong> Your app works perfectly. Users love it. But there&apos;s no <code>Content-Security-Policy</code>, no <code>X-Frame-Options</code>, no <code>Strict-Transport-Security</code>. These headers aren&apos;t visible to users — they&apos;re invisible until something goes wrong.
        </p>
        <p>
          <strong>What actually happened:</strong> Without CSP, an attacker who finds an XSS vector can run any script they want in your users&apos; browsers — steal session cookies, redirect to phishing pages, exfiltrate data. Without <code>X-Frame-Options</code>, your app can be embedded in an iframe on any site for clickjacking attacks. Without HSTS, users connecting over HTTP aren&apos;t automatically upgraded to HTTPS.
        </p>
        <p>
          <strong>What to do instead:</strong> Add these headers to your server response. In Next.js, add them to <code>next.config.js</code> under <code>headers()</code>. In Express, use the <code>helmet</code> middleware. At minimum: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
        </p>
        <p>
          <strong>How Scantient catches it:</strong> Every scan checks for the presence and correct configuration of all five critical security headers. Missing or misconfigured headers are flagged with severity ratings and specific fix instructions.
        </p>

        <h2>3. Overpermissive CORS (You Just Opened Your API to Everyone)</h2>
        <p>
          <strong>What it looks like:</strong> You&apos;re getting CORS errors during development. The fastest fix is <code>Access-Control-Allow-Origin: *</code>. It works. You ship it to production.
        </p>
        <p>
          <strong>What actually happened:</strong> Any website in the world can now make authenticated requests to your API using your users&apos; session cookies. A malicious site can read your users&apos; private data, make purchases on their behalf, or extract their account information — all without them knowing.
        </p>
        <p>
          <strong>What to do instead:</strong> Lock CORS to specific origins: <code>Access-Control-Allow-Origin: https://yourapp.com</code>. In development you can allow localhost; in production it should be an explicit allowlist. Never use <code>*</code> in combination with <code>credentials: true</code>.
        </p>
        <p>
          <strong>How Scantient catches it:</strong> We probe your API endpoints and check CORS response headers. Wildcard policies and overpermissive configurations are flagged as high-severity findings.
        </p>

        <h2>4. Leaving Debug Endpoints Exposed in Production</h2>
        <p>
          <strong>What it looks like:</strong> During development, you added <code>/api/debug</code>, <code>/admin/test</code>, or you deployed to a platform that automatically exposes server status endpoints. Maybe your AI coding assistant (Cursor, Copilot) added a health check route that dumps environment variables.
        </p>
        <p>
          <strong>What actually happened:</strong> Attackers probe for common paths within minutes of finding a new app. Endpoints like <code>/.env</code>, <code>/.git/HEAD</code>, <code>/api/admin</code>, <code>/phpinfo.php</code>, Spring Boot actuators — these are checked automatically by every basic vulnerability scanner. If yours respond with 200, that data is exposed.
        </p>
        <p>
          <strong>What to do instead:</strong> Return 404 (not 403) for sensitive paths. Review every route your AI assistant added. Remove debug endpoints before deploying. Consider a WAF rule to block probes for these paths.
        </p>
        <p>
          <strong>How Scantient catches it:</strong> We test 15 common dangerous paths on every <Link href="/score" className="text-prussian-blue-600 hover:underline">free scan</Link> — the same paths any attacker checks first. If they respond, you&apos;ll know before the attacker does.
        </p>

        <h2>5. No Auth Check on Server-Side Routes (Frontend-Only Auth)</h2>
        <p>
          <strong>What it looks like:</strong> Your dashboard checks if the user is logged in and hides the admin section if not. But the underlying <code>/api/users</code> endpoint? It returns all users to anyone who calls it directly — because the auth check is only in the React component.
        </p>
        <p>
          <strong>What actually happened:</strong> Authentication that only exists on the frontend is not authentication. Any developer with Postman (or even just <code>curl</code>) can bypass your UI entirely and hit your APIs directly. This is how competitor data scraping, account takeovers, and data breaches happen at startups that &quot;definitely had auth.&quot;
        </p>
        <p>
          <strong>What to do instead:</strong> Every API route that returns user-specific or sensitive data must verify a valid session token server-side before processing the request. Never trust the frontend to enforce authorization.
        </p>
        <p>
          <strong>How Scantient catches it:</strong> We detect auth patterns that appear to be frontend-only — hardcoded role checks in JavaScript bundles, API routes that accept requests without any auth headers, and public endpoints returning data that looks user-specific.
        </p>

        <h2>6. SSL Certificate Expiry (Your Site Goes Down, You Find Out from a Customer)</h2>
        <p>
          <strong>What it looks like:</strong> Everything is fine — until it isn&apos;t. Your SSL certificate expires. Your site shows a security warning to every visitor. Conversion drops to zero. You find out from a Slack message at 6 AM: &quot;Hey, your site says it&apos;s not secure?&quot;
        </p>
        <p>
          <strong>What actually happened:</strong> SSL certificates expire. It&apos;s not a security attack — it&apos;s an operational failure. But the result is the same: 100% of users see a browser warning and most will leave. For B2B SaaS, this is potentially fatal to a sales cycle.
        </p>
        <p>
          <strong>What to do instead:</strong> Use Let&apos;s Encrypt with auto-renewal (most platforms handle this). Set calendar reminders 30, 14, and 7 days before expiry for any cert you manage manually. Monitor it automatically.
        </p>
        <p>
          <strong>How Scantient catches it:</strong> Every scan checks your SSL certificate validity and expiry date. You&apos;ll get alerts at 30, 14, and 7 days before expiry — long before it becomes a crisis.
        </p>

        <h2>7. Skipping the Startup Security Checklist Before Launch</h2>
        <p>
          <strong>What it looks like:</strong> You built something great. You shipped. You told users about it. But you didn&apos;t run a single security check before launch — because security felt like an enterprise problem, something to worry about after you get traction.
        </p>
        <p>
          <strong>What actually happened:</strong> The average cost of a data breach for a small business is $120,000 (IBM 2024). Most startups don&apos;t survive one. And the uncomfortable truth: breaches happen at companies with <em>no users</em>, too — because attackers scrape new domains from DNS logs, certificate transparency logs, and product launches. You&apos;re being probed within hours of going live.
        </p>
        <p>
          <strong>What to do instead:</strong> Run a security audit before launch. It doesn&apos;t have to be expensive or time-consuming. A 60-second external scan catches the most common critical issues — the ones that make attackers say &quot;this one is easy.&quot;
        </p>
        <p>
          <strong>How Scantient catches it:</strong> <Link href="/score" className="text-prussian-blue-600 hover:underline">One free scan</Link> covers all seven of these mistake categories. No signup, no SDK, no setup. Paste your URL, get your security score, and know exactly what to fix before your first real user hits your app.
        </p>

        <h2>The Startup Security Checklist</h2>
        <p>
          Before you launch (or right now, for apps already live):
        </p>
        <ul>
          <li>✅ No secret keys in client-side JavaScript or environment variables prefixed <code>NEXT_PUBLIC_</code></li>
          <li>✅ Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy</li>
          <li>✅ CORS locked to specific origins, never <code>*</code> with credentials</li>
          <li>✅ No debug/admin endpoints exposed publicly</li>
          <li>✅ All API routes verify auth server-side, never trust frontend-only checks</li>
          <li>✅ SSL certificate monitored with alerts before expiry</li>
          <li>✅ Run an external security scan before launch</li>
        </ul>
        <p>
          The difference between a startup that survives its first security incident and one that doesn&apos;t isn&apos;t luck — it&apos;s whether they ran the checklist.
        </p>
        <p>
          If you want to know how your app stacks up against <Link href="/vs-snyk" className="text-prussian-blue-600 hover:underline">enterprise security tools like Snyk</Link> without the enterprise price tag, <Link href="/pricing" className="text-prussian-blue-600 hover:underline">Scantient&apos;s lifetime deal is $79</Link> — less than a month of most security tools, with no recurring fees.
        </p>

      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
        <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
          Find out which of these mistakes are in your app right now
        </h3>
        <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
          Run a free scan now. 60 seconds. No signup. No SDK. Just paste your URL.
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
          <Link href="/vs-snyk" className="text-sm text-prussian-blue-600 hover:underline">
            Scantient vs Snyk: Post-Deploy Security Without Enterprise Pricing →
          </Link>
          <Link href="/blog/snyk-vs-scantient-what-your-startup-needs" className="text-sm text-prussian-blue-600 hover:underline">
            Snyk vs Scantient: What Your Startup Actually Needs →
          </Link>
          <Link href="/vs-gitguardian" className="text-sm text-prussian-blue-600 hover:underline">
            Scantient vs GitGuardian: Secrets Detection vs Full Security Posture →
          </Link>
        </div>
      </div>
    </article>
    </>
  );
}
