import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The AI Writes the Code. Who's Checking What It Built? | Scantient Blog",
  description:
    "Vibe coding tools are valued at $50B+. Studies show 69 vulnerabilities in 15 tested apps, SSRF in 100% of apps, and 2,000+ flaws across 5,600 production deployments. Here's what the data says.",
  keywords: "vibe coding security, AI generated code vulnerabilities, Cursor security risks, Claude Code security, AI code SSRF, vibe coding OWASP, production API security",
  openGraph: {
    title: "The AI Writes the Code. Who's Checking What It Built?",
    description:
      "69 vulnerabilities. 15 apps. SSRF in 100% of cases. Zero working CSRF protection. The data on what vibe-coded applications ship with.",
    url: "https://scantient.com/blog/vibe-coding-who-checks-ai-code",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-28T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "The AI Writes the Code. Who's Checking What It Built?",
    description:
      "69 vulnerabilities in 15 AI-coded apps. SSRF rate: 100%. Zero CSRF protection. Here's what the research found.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The AI Writes the Code. Who's Checking What It Built?",
  description:
    "Vibe coding tools are valued at $50B+. Studies show 69 vulnerabilities in 15 tested apps, SSRF in 100% of apps, and 2,000+ flaws across 5,600 production deployments.",
  datePublished: "2026-03-28T00:00:00Z",
  dateModified: "2026-03-28T00:00:00Z",
  author: {
    "@type": "Person",
    name: "Peter Schliesmann",
    url: "https://scantient.com/about",
    jobTitle: "Founder",
    sameAs: ["https://www.linkedin.com/in/peterschliesmann"],
  },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/vibe-coding-who-checks-ai-code",
  mainEntityOfPage: "https://scantient.com/blog/vibe-coding-who-checks-ai-code",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".article-lede"],
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
      name: "The AI Writes the Code. Who's Checking What It Built?",
      item: "https://scantient.com/blog/vibe-coding-who-checks-ai-code",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are vibe-coded apps less secure than hand-written code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Research shows AI-generated code has 2.74x more XSS vulnerabilities and 1.91x more insecure direct object references compared to human-written code. The Tenzai study found 69 vulnerabilities across 15 apps built with tools like Cursor, Claude Code, and Replit. All 15 had SSRF. None had working CSRF protection.",
      },
    },
    {
      "@type": "Question",
      name: "What security vulnerabilities do AI coding tools miss most often?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI coding tools consistently miss SSRF protection (found in 100% of tested apps), CSRF tokens on state-changing endpoints, security headers at the web server level, and secrets management. The tools generate working application code without addressing the security configuration layer.",
      },
    },
    {
      "@type": "Question",
      name: "How do I check if my vibe-coded app has security issues?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run an external API scan against your deployed application. Scantient tests your live API from the outside, checking for SSRF, injection, missing auth, CORS misconfigurations, exposed secrets, and security headers. No code access required.",
      },
    },
    {
      "@type": "Question",
      name: "Does Scantient work on apps built with Cursor or Claude Code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Scantient scans any deployed API endpoint, regardless of how the code was written. It tests from the outside, which means it finds the same issues an attacker would find in a vibe-coded app.",
      },
    },
  ],
};

export default function VibeCodingWhoChecksPage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
            <span className="rounded-full bg-info/10 dark:bg-info/20 px-2.5 py-0.5 text-xs font-semibold text-info dark:text-info border border-info/30 dark:border-info/40">
              AI Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            The AI Writes the Code. Who&apos;s Checking What It Built?
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400 article-lede">
            Cursor is valued at $50 billion. Claude Code generates $2.5 billion in annual recurring
            revenue. The market for AI coding tools has crossed $5 billion and keeps growing.
            Millions of production APIs are being built with these tools right now. Almost none of
            them get a security check before they go live.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-28">March 28, 2026</time>
            <span>·</span>
            <span>9 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            AI coding tools let a founder with no backend experience build a production API before
            lunch. A small team ships a feature before the sprint ends. The tools are genuinely
            fast. The code runs. Users sign up.
          </p>
          <p>
            The problem is not whether the code works. The problem is what ships alongside it.
          </p>

          <h2>What the Research Found</h2>
          <p>
            In January 2026, Tenzai took 15 apps built entirely with Claude Code, Cursor, Replit,
            Devin, and OpenAI Codex. They ran a security audit against each one. The results:
          </p>
          <ul>
            <li>69 total vulnerabilities across 15 apps</li>
            <li>SSRF in 100% of apps . every single one</li>
            <li>Zero apps with working CSRF protection</li>
            <li>Zero apps with security headers configured</li>
            <li>One rate limit across the entire set, and it was bypassable</li>
          </ul>
          <p>
            These were not prototype apps or toy projects. They were functional applications built
            with the most popular AI coding tools available.
          </p>
          <p>
            Escape.tech audited a wider sample: 5,600 vibe-coded applications running in
            production. Across those deployments: 2,000+ vulnerabilities, 400+ exposed secrets
            (API keys, authentication tokens, service credentials), and 175 personal data
            exposures including medical records and bank account numbers. Real user data. Real
            production systems.
          </p>
          <p>
            CodeRabbit compared AI-generated code to human-written code at scale. AI code carries
            2.74 times more XSS vulnerabilities and 1.91 times more insecure direct object
            references. GitClear found code churn up 44% and duplication up 48% in AI-assisted
            codebases.
          </p>
          <p>
            The pattern is consistent: AI coding tools generate code that runs. Running is not the
            same as safe.
          </p>

          <h2>The Vulnerabilities AI Code Gets Wrong, Reliably</h2>
          <p>
            The failures cluster around the same categories across every study. Understanding them
            explains why the numbers are so consistent.
          </p>

          <h3>SSRF</h3>
          <p>
            Server-Side Request Forgery appears in every tested vibe-coded app. AI tools generate
            HTTP request handlers that accept a URL from user input and fetch it. The code
            functions. The function is a backdoor.
          </p>
          <p>
            An attacker sends a request pointing to the cloud provider&apos;s internal metadata
            endpoint. The API fetches it and returns instance credentials. This works in AWS, GCP,
            and Azure. SSRF has been the entry point for major cloud breaches for years.
          </p>
          <p>
            Fixing SSRF requires URL validation before the fetch. AI tools skip this step because
            developers rarely include &quot;validate the destination URL&quot; in their prompts.
          </p>

          <h3>CSRF</h3>
          <p>
            Cross-Site Request Forgery protection requires generating a token for each session,
            including it in forms and state-changing requests, and validating it server-side.
            None of the 15 apps in the Tenzai study had this in place.
          </p>
          <p>
            AI tools generate the application logic. They do not generate the anti-CSRF layer
            unless explicitly asked. Most developers do not ask.
          </p>

          <h3>Security headers</h3>
          <p>
            Content-Security-Policy, X-Frame-Options, Strict-Transport-Security,
            X-Content-Type-Options . these headers require server-level configuration, not
            application code. AI tools write application code. They do not configure the web
            server or the deployment platform.
          </p>
          <p>
            Zero apps in the Tenzai study had any of these headers. Missing headers enable
            clickjacking, MIME sniffing attacks, and cross-site scripting via injected content.
          </p>

          <h3>Secrets exposure</h3>
          <p>
            AI tools help integrate third-party APIs and services. They generate configuration
            code. Developers set credentials in environment variables or config files. Some
            commit them to source. Some expose them in error responses. Some return them in
            API responses without realizing the field is included.
          </p>
          <p>
            400+ secrets exposed across 5,600 apps. That is not a rounding error.
          </p>

          <h3>Injection</h3>
          <p>
            SQL injection and command injection appear when AI-generated code passes user input
            directly to a database query or shell command. The code works in development where
            inputs are clean. In production, inputs are not clean.
          </p>
          <p>
            AI tools generate parameterized queries when asked. They generate unsafe string
            concatenation when not asked. Developers rarely ask.
          </p>

          <h2>How Scantient Maps to the CSA Security Checklist</h2>
          <p>
            The Cloud Security Alliance publishes AI security guidance aligned with the OWASP
            API Security Top 10. Each category in that checklist corresponds to a class of
            vulnerabilities AI coding tools miss. Each category is something{" "}
            <Link href="https://scantient.com/score" className="text-prussian-blue-600 hover:underline">
              Scantient scans
            </Link>{" "}
            automatically.
          </p>

          <p>
            <strong>Injection (OWASP API1):</strong> SQL injection, command injection, path
            traversal. Scantient sends crafted payloads to your live API endpoints and checks
            whether the application processes them unsafely.
          </p>
          <p>
            <strong>SSRF (OWASP API7):</strong> The vulnerability present in every app Tenzai
            tested. Scantient tests whether your API will fetch arbitrary URLs provided in
            request parameters.
          </p>
          <p>
            <strong>Security misconfiguration (OWASP API8):</strong> Missing headers, permissive
            CORS policies, verbose error messages with stack traces. Scantient checks response
            headers, CORS behavior, and error response content against expected baselines.
          </p>
          <p>
            <strong>Secrets exposure (OWASP API3):</strong> Exposed API keys, tokens, and
            credentials returned in responses or error messages. Scantient scans response bodies
            for credential patterns and flags anything that matches known formats.
          </p>
          <p>
            <strong>Missing authentication (OWASP API2):</strong> Endpoints accessible without
            credentials. Scantient tests endpoints without authentication and verifies the
            application rejects the request.
          </p>
          <p>
            The AI writes the code, but the responsibility stays with you. That responsibility
            includes knowing what your deployed API actually exposes to the internet.
          </p>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Built with Cursor, Claude Code, or Replit?
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scantient scans your deployed API for the exact vulnerabilities the research found:
              SSRF, injection, missing auth, CORS misconfigurations, exposed secrets, and security
              headers. Free scan. No signup. No code access.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>The Market Funds Builders. Not Checkers.</h2>
          <p>
            Cursor raised at a $50 billion valuation. Replit raised hundreds of millions.
            The investors funding AI coding tools are funding speed. Ship faster. Build faster.
            Deploy faster.
          </p>
          <p>
            None of those companies are responsible for what ships. Their product is the code
            generation. The security of the deployed application belongs to the developer.
          </p>
          <p>
            This creates a gap. A founder builds an API in an afternoon with Claude Code or
            Cursor. The app goes live. The database holds user emails, payment methods, health
            information. The API has SSRF because the developer never asked the AI to validate
            URLs. The API has no CSRF protection because the developer never asked for tokens.
            The developer does not know these things are missing. The AI did not mention them.
          </p>
          <p>
            175 personal data exposures across 5,600 apps. Medical records. Bank account numbers.
            These came from applications built by real developers who shipped real products to
            real users without knowing what was exposed.
          </p>

          <h2>What Automated Scanning Catches</h2>
          <p>
            External API scanning works from the outside. No agent. No SDK. No access to your
            codebase. Scantient sends requests to your live API endpoints and analyzes the
            responses for vulnerability patterns.
          </p>
          <p>
            This is the same perspective an attacker has. The scanner does not care whether
            the code was written by a human or an AI. The scanner tests what is exposed.
          </p>
          <p>
            For a vibe-coded application, a scan gives you the information the AI tool did not:
            whether SSRF protection is in place, whether authentication is enforced on every
            endpoint, whether your CORS configuration allows cross-origin requests from arbitrary
            origins, whether any credentials appear in response bodies, whether your security
            headers are configured.
          </p>
          <p>
            The Tenzai results and the Escape.tech results describe the baseline state of
            vibe-coded apps before a scan. The gaps are systematic. The fixes are knowable.
            The scan tells you where to start.
          </p>
          <p>
            Run a free scan before your users find the holes.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Run a Free Scan on Your Vibe-Coded API
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            Scantient scans your deployed API from the outside: SSRF, injection, missing auth,
            CORS, secrets, and security headers. Same checks the Tenzai study used. Free to run.
            No signup required.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
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
              href="/blog/vibe-coding-security-risks"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Vibe Coding Security Risks: What AI-Generated Code Gets Wrong About APIs →
            </Link>
            <Link
              href="/blog/owasp-llm-top-10-api-builders"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              OWASP LLM Top 10 for API Builders →
            </Link>
            <Link
              href="/blog/securing-ai-app-api"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Securing the API Your AI App Calls →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
