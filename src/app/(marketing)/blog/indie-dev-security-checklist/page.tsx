import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Indie Dev Security Checklist: Ship Fast Without Getting Hacked | Scantient Blog",
  description:
    "A practical startup security checklist for indie developers. 12 security items to check before (and after) launch — what to do, why it matters, and how to verify each one.",
  keywords: "startup security checklist, indie dev security, api security tools, ship fast security, developer security checklist, api vulnerability scanner",
  openGraph: {
    title: "The Indie Dev Security Checklist: Ship Fast Without Getting Hacked",
    description:
      "12 security checks every indie dev should run before launch. Practical, fast, zero-fluff. Each item: what to do, why it matters, how to verify.",
    url: "https://scantient.com/blog/indie-dev-security-checklist",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-21T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Indie Dev Security Checklist: Ship Fast Without Getting Hacked",
    description:
      "12 security items indie devs should check before launch. Practical checklist, no enterprise BS.",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://scantient.com/blog" },
    { "@type": "ListItem", position: 3, name: "The Indie Dev Security Checklist: Ship Fast Without Getting Hacked", item: "https://scantient.com/blog/indie-dev-security-checklist" },
  ],
};

export default function IndieDevSecurityChecklistPage() {
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
          <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
            Checklist
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
          The Indie Dev Security Checklist: Ship Fast Without Getting Hacked
        </h1>
        <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
          Security doesn&apos;t have to slow you down. But ignoring it will. Here&apos;s a practical pre-launch checklist for indie developers and startup teams — every item is actionable, fast, and specific about what to check and how.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
          <time dateTime="2026-03-21">March 21, 2026</time>
          <span>·</span>
          <span>10 min read</span>
        </div>
      </div>

      {/* Body */}
      <div className="prose prose-slate dark:prose-invert max-w-none">

        <p>
          Indie devs get security wrong in a predictable way: not from ignorance, but from timing. Security is the thing you&apos;ll &quot;handle later&quot; — after you validate the idea, after you get your first users, after you hit $1K MRR. Then you forget. Then something breaks.
        </p>
        <p>
          This checklist is designed for the reality of how indie devs work: fast, solo or tiny team, shipping constantly, no dedicated security team. Each item is specific — what exactly to check, how to check it, and why attackers care.
        </p>
        <p>
          The good news: most of these take under 30 minutes total to verify. A <Link href="/score" className="text-prussian-blue-600 hover:underline">single automated scan</Link> covers the majority of them in 60 seconds.
        </p>

        <h2>Before You Launch</h2>

        <h3>✅ 1. No Secret Keys in Client-Side JavaScript</h3>
        <p>
          <strong>What to check:</strong> Open your deployed app in Chrome. Go to DevTools → Sources → look in your JavaScript bundle files. Search for patterns like <code>sk_live_</code> (Stripe), <code>sk-</code> (OpenAI), <code>eyJ</code> (JWTs), or any key you recognize from your <code>.env</code> file.
        </p>
        <p>
          <strong>Why attackers care:</strong> Exposed secret keys are instant account compromise. A real startup founder lost $50K in Stripe charges in 4 hours because their live key was in a public JavaScript bundle. Attackers scan GitHub, npm packages, and JavaScript bundles continuously using automated tools.
        </p>
        <p>
          <strong>Fix:</strong> Secret keys go on the server only. Use server-side API routes to proxy calls. Never use <code>NEXT_PUBLIC_</code> for anything secret. Only publishable/public keys go to the client.
        </p>
        <p>
          <strong>How Scantient helps:</strong> We scan your JavaScript bundles on every run for 20+ known API key patterns. If a key is exposed, you know before launch.
        </p>

        <h3>✅ 2. Security Headers Are Present and Correct</h3>
        <p>
          <strong>What to check:</strong> Go to <a href="https://securityheaders.com" target="_blank" rel="noopener noreferrer" className="text-prussian-blue-600 hover:underline">securityheaders.com</a> and paste your URL. You want an A or B grade. Specifically look for: <code>Content-Security-Policy</code>, <code>Strict-Transport-Security</code>, <code>X-Frame-Options</code>, <code>X-Content-Type-Options</code>, <code>Referrer-Policy</code>.
        </p>
        <p>
          <strong>Why attackers care:</strong> Missing CSP means successful XSS attacks can steal session cookies. Missing X-Frame-Options enables clickjacking (your login page embedded in an attacker&apos;s iframe). Missing HSTS means you can be downgraded to HTTP by a man-in-the-middle.
        </p>
        <p>
          <strong>Fix (Next.js):</strong> Add to <code>next.config.js</code>:
        </p>
        <pre><code>{`async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    ],
  }];
}`}</code></pre>

        <h3>✅ 3. CORS Is Locked to Specific Origins</h3>
        <p>
          <strong>What to check:</strong> Open DevTools → Network. Find a request to your API. Look at the response headers for <code>Access-Control-Allow-Origin</code>. If it says <code>*</code>, that&apos;s a problem. It should say your exact domain: <code>https://yourdomain.com</code>.
        </p>
        <p>
          <strong>Why attackers care:</strong> <code>Access-Control-Allow-Origin: *</code> with <code>credentials: include</code> means any website in the world can make authenticated API requests using your users&apos; cookies. This is how data exfiltration via third-party sites works.
        </p>
        <p>
          <strong>Fix:</strong> Never use <code>*</code> in production CORS policies. Use an explicit allowlist of your actual domains.
        </p>

        <h3>✅ 4. No Exposed Debug Endpoints</h3>
        <p>
          <strong>What to check:</strong> Try these URLs on your production domain:
          <code>/.env</code>, <code>/.git/HEAD</code>, <code>/api/admin</code>, <code>/phpinfo.php</code>, <code>/wp-admin</code>, <code>/actuator/health</code> (Spring Boot), <code>/debug</code>.
          They should all return 404, not 200 or 403.
        </p>
        <p>
          <strong>Why attackers care:</strong> Attackers run automated scripts that probe every new domain on the internet for these paths within hours of launch. A <code>/.env</code> returning 200 exposes your database connection strings, API keys, and service credentials. This is how most indie dev breaches happen — not clever hacking, just checking obvious paths.
        </p>
        <p>
          <strong>Fix:</strong> Return 404 (not 403) for these paths. 403 tells attackers the path exists. 404 is ambiguous.
        </p>

        <h3>✅ 5. All API Routes Have Server-Side Auth Checks</h3>
        <p>
          <strong>What to check:</strong> Open your API route files. For every endpoint that returns user-specific data, check that the first thing it does is verify a session token. Not check a variable. Not call a client-side function. Actually verify a JWT/session against your auth provider.
        </p>
        <p>
          <strong>Why attackers care:</strong> Frontend-only auth is the most common critical vulnerability in indie dev apps. You check if the user is logged in the React component, but the API route itself accepts any request. A developer with curl can bypass your entire UI and access your data.
        </p>
        <p>
          <strong>Fix:</strong> In every API route that handles sensitive data: <code>const session = await getServerSession(authOptions); if (!session) return 401;</code>. No exceptions.
        </p>

        <h3>✅ 6. SSL Certificate Is Valid and Monitored</h3>
        <p>
          <strong>What to check:</strong> Go to <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noopener noreferrer" className="text-prussian-blue-600 hover:underline">SSL Labs</a> and run a test on your domain. You want grade A. Also note the expiry date — it should be 30+ days away.
        </p>
        <p>
          <strong>Why attackers care:</strong> An expired certificate takes your site offline with a browser security warning. 100% of users see it and most leave. For B2B, it can kill a deal. For e-commerce, it stops all purchases instantly.
        </p>
        <p>
          <strong>Fix:</strong> Use Let&apos;s Encrypt with auto-renewal (most platforms handle this). Set a calendar reminder 30 days before expiry for any manually managed cert. Or use Scantient to alert you automatically.
        </p>

        <h2>Infrastructure &amp; Deployment</h2>

        <h3>✅ 7. No Secrets in Git History</h3>
        <p>
          <strong>What to check:</strong> Run <code>git log -p | grep -E &apos;(password|secret|api.?key|token)&apos; -i | head -50</code> in your repo. Also check if your <code>.env</code> file was ever committed: <code>git log --all --full-history -- .env</code>.
        </p>
        <p>
          <strong>Why attackers care:</strong> GitHub is continuously scanned by automated tools looking for secrets. Even if you delete the file, it stays in git history. Even private repos can leak if you ever change visibility or a collaborator&apos;s account is compromised.
        </p>
        <p>
          <strong>Fix:</strong> Use <code>git-filter-repo</code> to remove secrets from history. Rotate any credentials that were ever in git. Add <code>.env*</code> to <code>.gitignore</code> immediately.
        </p>

        <h3>✅ 8. Environment Variables Are Set Correctly in Production</h3>
        <p>
          <strong>What to check:</strong> Compare your production environment variable list against your <code>.env.example</code> file. Every variable that&apos;s required should be set. None should be test/placeholder values in production (look for: <code>test_</code>, <code>sk_test_</code>, <code>example</code>, <code>your_key_here</code>).
        </p>
        <p>
          <strong>Why attackers care:</strong> Apps running with test API keys often have weaker validation, rate limiting, or logging. Stripe test mode processes don&apos;t charge real cards — which looks like a payment went through but nothing was billed.
        </p>
        <p>
          <strong>Fix:</strong> Audit your Vercel/Railway/Heroku environment variable dashboard before launch. Every <code>sk_test_</code> becomes <code>sk_live_</code>.
        </p>

        <h3>✅ 9. Database Connections Are Not Public</h3>
        <p>
          <strong>What to check:</strong> If you&apos;re using Supabase, check that RLS (Row Level Security) is enabled on all tables. If you&apos;re using a managed Postgres, check that the connection string requires SSL (<code>sslmode=require</code>) and that the database is not exposed to 0.0.0.0/0.
        </p>
        <p>
          <strong>Why attackers care:</strong> An internet-facing database with weak credentials is compromised within minutes. This is one of the most common ways indie dev apps get data exfiltrated — not through the web app, but directly through the database.
        </p>
        <p>
          <strong>Fix:</strong> Database should accept connections only from your app servers (private networking). Always use SSL for database connections. Enable RLS in Supabase.
        </p>

        <h2>Ongoing Monitoring</h2>

        <h3>✅ 10. Rate Limiting on Authentication Endpoints</h3>
        <p>
          <strong>What to check:</strong> Try logging in with the wrong password 10 times in a row. Does your app slow down, show a captcha, or block the IP? If not, you have no rate limiting.
        </p>
        <p>
          <strong>Why attackers care:</strong> Without rate limiting, attackers can run credential stuffing attacks — trying millions of email/password combinations from breached databases. If any of your users reuse passwords (most do), their accounts can be taken over.
        </p>
        <p>
          <strong>Fix:</strong> Use Upstash Redis + @upstash/ratelimit in Next.js API routes. Or use a managed auth provider (Auth0, Clerk) that includes rate limiting.
        </p>

        <h3>✅ 11. Dependencies Are Updated and Scanned for CVEs</h3>
        <p>
          <strong>What to check:</strong> Run <code>npm audit</code> or <code>pnpm audit</code> in your project directory. Look for high and critical vulnerabilities. Also run <code>npm outdated</code> to see what&apos;s behind.
        </p>
        <p>
          <strong>Why attackers care:</strong> Known CVEs in popular packages get exploited at scale. The Log4Shell vulnerability affected millions of systems. Left-pad, event-stream, node-ipc — supply chain attacks through npm packages are real and frequent.
        </p>
        <p>
          <strong>Fix:</strong> Enable Dependabot in GitHub (free). Run <code>npm audit fix</code> weekly. Prioritize critical and high severity fixes. For medium, fix before the next launch.
        </p>

        <h3>✅ 12. Run a Full External Security Scan Before Launch</h3>
        <p>
          <strong>What to check:</strong> Run <Link href="/score" className="text-prussian-blue-600 hover:underline">a free Scantient scan</Link> on your production URL. This covers all of the above in one pass — exposed secrets, security headers, CORS, debug endpoints, SSL, and more. No signup, no SDK, just your URL.
        </p>
        <p>
          <strong>Why attackers care:</strong> An external scan mimics exactly what an attacker does in the first 5 minutes of probing a new target. If anything obvious is exposed, you&apos;ll know before they do.
        </p>
        <p>
          <strong>How Scantient helps:</strong> The free scan covers all the categories above. For ongoing monitoring (so you know immediately when something changes in production), <Link href="/pricing" className="text-prussian-blue-600 hover:underline">the lifetime deal is $79</Link> — continuous monitoring with alerts, no recurring fees.
        </p>

        <h2>The Pre-Launch Checklist (Quick Reference)</h2>
        <div className="not-prose rounded-xl border border-border bg-surface p-6 my-6">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>No secret keys in client-side JavaScript (<code>NEXT_PUBLIC_</code>)</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>Security headers present: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>CORS locked to specific origins, never <code>*</code></span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>No debug endpoints returning 200 in production</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>Every API route verifies auth server-side</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>SSL certificate valid and monitored for expiry</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>No secrets in git history</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>Production env vars set (no test keys in production)</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>Database not publicly accessible, RLS enabled</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>Rate limiting on auth endpoints</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>npm audit run, no critical/high CVEs</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold mt-0.5">✅</span><span>External security scan completed before launch</span></li>
          </ul>
        </div>

        <p>
          If you want to read more about the specific mistakes that cause the worst breaches, check the <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">7 API security mistakes killing startups</Link> post — each mistake maps to one of these checklist items with real-world examples. And once you&apos;ve shipped, don&apos;t forget your <Link href="/blog/post-deploy-security-checklist" className="text-prussian-blue-600 hover:underline">post-deployment security checks</Link> — the risks change once real traffic hits your app.
        </p>

      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
        <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
          Run the automated version of this checklist in 60 seconds
        </h3>
        <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
          Free scan covers items 1–6 and 12 automatically. No signup. Just paste your URL.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/score"
            className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
          >
            Run your free security scan →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-6 py-3 text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
          >
            Get continuous monitoring ($79 LTD)
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
          <Link href="/blog/why-ctos-choose-external-security-scanning" className="text-sm text-prussian-blue-600 hover:underline">
            Why CTOs Choose External Security Scanning Over Code-Level Tools →
          </Link>
          <Link href="/score" className="text-sm text-prussian-blue-600 hover:underline">
            Run a free security scan on your app →
          </Link>
        </div>
      </div>
    </article>
    </>
  );
}
