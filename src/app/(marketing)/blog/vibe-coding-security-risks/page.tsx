import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vibe Coding Security Risks: What AI-Generated Code Gets Wrong About APIs | Scantient Blog",
  description:
    "AI coding tools let anyone ship a production API in hours. Here's what vibe-coded applications consistently get wrong about security . and what to check before you go live.",
  keywords: "vibe coding security, AI generated code security, vibe coding risks, AI code security vulnerabilities, LLM generated code security, Cursor security, Copilot security risks",
  openGraph: {
    title: "Vibe Coding Security Risks: What AI-Generated Code Gets Wrong About APIs",
    description:
      "Vibe coding ships fast. It also ships with predictable, systematic security gaps. Here's what AI-generated APIs consistently get wrong . and how to fix it before you get hacked.",
    url: "https://scantient.com/blog/vibe-coding-security-risks",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-15T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Coding Security Risks: What AI-Generated Code Gets Wrong About APIs",
    description:
      "Vibe coding security risks: what AI-generated APIs consistently get wrong about authentication, rate limiting, input validation, and more.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Vibe Coding Security Risks: What AI-Generated Code Gets Wrong About APIs",
  description:
    "AI coding tools let anyone ship a production API in hours. Here's what vibe-coded applications consistently get wrong about security . and what to check before you go live.",
  datePublished: "2026-03-15T00:00:00Z",
  dateModified: "2026-03-15T00:00:00Z",
  author: { "@type": "Organization", name: "Scantient" },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/vibe-coding-security-risks",
  mainEntityOfPage: "https://scantient.com/blog/vibe-coding-security-risks",
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
      name: "Vibe Coding Security Risks: What AI-Generated Code Gets Wrong About APIs",
      item: "https://scantient.com/blog/vibe-coding-security-risks",
    },
  ],
};

export default function VibeCodingSecurityRisksPage() {
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
            <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
              AI Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            Vibe Coding Security Risks: What AI-Generated Code Gets Wrong About APIs
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            Vibe coding ships product fast. It also ships with predictable, systematic security gaps
            . because AI models optimize for functional code, not secure code. Here&apos;s what to look
            for and fix before you go live.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-15">March 15, 2026</time>
            <span>·</span>
            <span>9 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            Vibe coding . using AI tools like Cursor, Copilot, Claude, or v0 to generate entire
            features or applications . has collapsed the time from idea to deployed product.
            Founders who couldn&apos;t write a backend a year ago are now shipping full-stack SaaS apps
            in weekends.
          </p>
          <p>
            This is genuinely exciting. It&apos;s also creating a new class of security problems that
            the industry is only beginning to document. AI models are trained on vast amounts of
            code . including insecure code . and they optimize for getting the task done, not for
            getting it done securely. The result is a predictable set of security gaps that appear
            in vibe-coded applications with striking consistency.
          </p>
          <p>
            If you&apos;ve built your app primarily with AI assistance, this article is a checklist of
            what to verify before you go live. These aren&apos;t theoretical risks . they&apos;re patterns
            we see repeatedly.
          </p>

          <h2>Why AI-Generated Code Has Systematic Security Gaps</h2>
          <p>
            The problem isn&apos;t that AI models are bad at writing code. They&apos;re remarkably good.
            The problem is that security is context-dependent in ways that are hard to convey in
            a prompt.
          </p>
          <p>
            When you ask an AI to &quot;build a REST API for user authentication,&quot; it will build a
            functional authentication system. But it might:
          </p>
          <ul>
            <li>Omit rate limiting because you didn&apos;t ask for it</li>
            <li>Use a weak JWT secret if you didn&apos;t specify key strength</li>
            <li>Return overly verbose error messages that reveal system internals</li>
            <li>Skip security headers because they&apos;re not visible in the happy path</li>
            <li>Implement CORS permissively (&quot;*&quot;) to avoid debugging friction</li>
          </ul>
          <p>
            None of these are failures to understand the prompt. They&apos;re rational defaults for code
            that needs to work, in the absence of explicit security requirements. The AI generates
            what was asked for. Security is almost always an implicit requirement . and implicit
            requirements don&apos;t make it into the output.
          </p>

          <h2>The Most Common Vibe Coding Security Gaps</h2>

          <h3>1. Permissive CORS Configuration</h3>
          <p>
            Cross-Origin Resource Sharing (CORS) is one of the most commonly misconfigured
            settings in AI-generated APIs. When CORS causes friction during development (browser
            errors blocking requests), the AI&apos;s suggested fix is often to set{" "}
            <code>Access-Control-Allow-Origin: *</code> . allowing any website to make
            authenticated requests to your API.
          </p>
          <p>
            This is fine for truly public APIs. It&apos;s a serious problem for APIs that use cookies
            or that handle user-specific data. Check your CORS configuration and restrict the
            allowed origins to your actual frontend domains.
          </p>

          <h3>2. Missing Security Headers</h3>
          <p>
            Security headers . <code>Strict-Transport-Security</code>,{" "}
            <code>Content-Security-Policy</code>, <code>X-Frame-Options</code>,{" "}
            <code>X-Content-Type-Options</code> . protect against a range of attacks including
            XSS, clickjacking, and protocol downgrade. They have zero effect on functionality
            and are almost never included in AI-generated boilerplate.
          </p>
          <p>
            They&apos;re also the first thing an external scan will flag. If your API is missing these
            headers, it signals to scanners (and attackers) that the security fundamentals
            may not have been considered.
          </p>

          <h3>3. No Rate Limiting on Auth Endpoints</h3>
          <p>
            AI-generated authentication code is functional . it checks passwords, issues tokens,
            handles sessions. What it almost never includes is rate limiting on the login endpoint.
          </p>
          <p>
            Without rate limiting, your login endpoint is open to brute force attacks and
            credential stuffing. An attacker can test millions of password combinations without
            any throttling. This is trivially exploitable and trivially preventable.
          </p>
          <p>
            Check your login, password reset, and magic link endpoints. Each should be rate
            limited . at minimum by IP address, ideally also by user account.
          </p>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Scan your vibe-coded API before launch
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scantient checks your production API for the misconfigurations AI-generated code
              consistently produces . CORS, security headers, TLS, and more. Free, 60 seconds.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h3>4. Verbose Error Messages</h3>
          <p>
            AI models often generate error handling that is helpful for debugging: returning the
            full error object, the database query that failed, or a stack trace. This makes
            development much easier. It also tells attackers exactly what&apos;s happening inside
            your system.
          </p>
          <p>
            In production, errors should return generic messages to clients (&quot;Authentication
            failed,&quot; not &quot;User not found&quot; vs &quot;Incorrect password&quot;) and log detailed information
            server-side. AI-generated code frequently doesn&apos;t make this distinction.
          </p>
          <p>
            Review your error handling code. Any place a raw error object is serialized into
            an API response is a potential information disclosure vulnerability.
          </p>

          <h3>5. Secrets in Client-Side Code</h3>
          <p>
            This one is particularly common in full-stack frameworks where the AI generates both
            frontend and backend code. API keys, service credentials, and other secrets
            occasionally end up in client-side bundles . either through environment variable
            naming errors (<code>NEXT_PUBLIC_SECRET_KEY</code>) or by being directly embedded
            in frontend code.
          </p>
          <p>
            Search your client-side bundle for any sensitive-looking strings. Run{" "}
            <code>grep -r &quot;sk_\|pk_\|secret\|api_key&quot; ./public ./out ./.next/static</code> before
            every production deployment.
          </p>

          <h3>6. Authorization Gaps Between Features</h3>
          <p>
            When you build features incrementally with AI assistance . &quot;now add the ability for
            users to share projects&quot; . each new feature is generated in isolation. The AI
            implements the sharing feature correctly, but it may not consider whether the new
            sharing endpoint respects the same authorization rules as the rest of your API.
          </p>
          <p>
            This is the classic IDOR (Insecure Direct Object Reference) pattern: a new endpoint
            takes an object ID and returns data, but doesn&apos;t verify that the requesting user owns
            that object. Test every new endpoint by attempting to access resources belonging to
            a different test user.
          </p>

          <h3>7. Overpermissive Database Queries</h3>
          <p>
            AI-generated API code often selects more data than needed for a given request. A user
            profile endpoint might select all columns including internal fields, flags, and
            admin metadata . and return all of it in the response. This is a data minimization
            failure and can expose information that shouldn&apos;t be client-visible.
          </p>
          <p>
            Review your database queries and API responses. Make sure you&apos;re using field selection
            or response serialization to return only what the client needs.
          </p>

          <h2>The Vibe Coding Security Gap Is Structural</h2>
          <p>
            These aren&apos;t bugs in the AI tools. They&apos;re a structural consequence of how AI
            assistance works: you describe what you want to build, the AI builds something that
            works, and security . which is largely invisible in the happy path . gets skipped
            unless you explicitly ask for it.
          </p>
          <p>
            The solution isn&apos;t to stop using AI coding tools. It&apos;s to build a systematic security
            review into your development process. Before any vibe-coded feature ships to production:
          </p>
          <ul>
            <li>Run an external scan to check headers, TLS, and exposed endpoints</li>
            <li>Test authentication and authorization on every new route</li>
            <li>Verify error messages don&apos;t expose internals</li>
            <li>Check for secrets in client-side code</li>
            <li>Confirm rate limiting on sensitive endpoints</li>
          </ul>
          <p>
            For a complete look at the security implications of AI-generated applications, see{" "}
            <Link href="/vibe-coding-risks" className="text-prussian-blue-600 hover:underline">
              the full guide to vibe coding risks
            </Link>
            {" "}and{" "}
            <Link href="/blog/securing-ai-app-api" className="text-prussian-blue-600 hover:underline">
              how to secure your AI app&apos;s API
            </Link>
            . For the AI security posture of your deployed application,{" "}
            <Link href="/ai-security" className="text-prussian-blue-600 hover:underline">
              see Scantient&apos;s AI security features
            </Link>
            .
          </p>

          <h2>Vibe Coding Security Checklist</h2>
          <ul>
            <li>✅ CORS restricted to specific allowed origins (not *)</li>
            <li>✅ Security headers set: HSTS, CSP, X-Frame-Options, X-Content-Type-Options</li>
            <li>✅ Rate limiting on login, password reset, and magic link endpoints</li>
            <li>✅ Error messages generic in production responses; detailed logging server-side</li>
            <li>✅ No secrets in client-side bundles or NEXT_PUBLIC_ variables</li>
            <li>✅ Every new endpoint tested for IDOR (cross-user access attempt)</li>
            <li>✅ Database queries and API responses return only necessary fields</li>
            <li>✅ External scan run before each production deployment</li>
            <li>✅ Dependency audit run (npm audit) after each AI-generated dependency addition</li>
          </ul>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            Built with Cursor, Copilot, or Claude? Scantient checks your deployed API for the
            security gaps AI tools consistently leave behind. No code access. No setup.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Run a free scan now →
            </Link>
            <Link
              href="/vibe-coding-risks"
              className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-6 py-3 text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
            >
              See all vibe coding risks →
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-4">Related</h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/ai-security"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Scantient AI Security Features →
            </Link>
            <Link
              href="/vibe-coding-risks"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              The Hidden Security Risks of Vibe-Coded Applications →
            </Link>
            <Link
              href="/blog/securing-ai-app-api"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Securing Your AI App&apos;s API: What to Check Before Launch →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
