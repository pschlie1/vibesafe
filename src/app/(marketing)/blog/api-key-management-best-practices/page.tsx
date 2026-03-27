import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Key Management: How to Store, Rotate, and Protect Your Keys | Scantient Blog",
  description:
    "How to store API keys securely, rotation policies, vault services, and what to do when a key is exposed. A practical guide to API key management for developers and startups.",
  keywords: "API key management, how to store API keys securely, API key rotation, API key security, environment variables API keys, secrets management",
  openGraph: {
    title: "API Key Management: How to Store, Rotate, and Protect Your Keys",
    description:
      "Practical API key management: where to store keys, how to rotate them, how to detect exposure, and what vault services actually help.",
    url: "https://scantient.com/blog/api-key-management-best-practices",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-02-12T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Key Management: How to Store, Rotate, and Protect Your Keys",
    description:
      "Stop committing API keys to git. A practical guide to API key management: environment variables, vault services, rotation policies, and exposure detection.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "API Key Management: How to Store, Rotate, and Protect Your Keys",
  description:
    "How to store API keys securely, rotation policies, vault services, and what to do when a key is exposed. A practical guide to API key management.",
  datePublished: "2026-02-12T00:00:00Z",
  dateModified: "2026-02-12T00:00:00Z",
  author: { "@type": "Person", "name": "Peter Schliesmann", "url": "https://scantient.com/about", "jobTitle": "Founder", "sameAs": ["https://www.linkedin.com/in/peterschliesmann"] },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/api-key-management-best-practices",
  mainEntityOfPage: "https://scantient.com/blog/api-key-management-best-practices",
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
      name: "API Key Management: How to Store, Rotate, and Protect Your Keys",
      item: "https://scantient.com/blog/api-key-management-best-practices",
    },
  ],
};

export default function ApiKeyManagementBestPracticesPage() {
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
      "name": "What are API key management best practices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rotate API keys regularly, never commit them to source control, use environment variables or secret managers, apply least-privilege scoping, and audit key usage. Revoke keys immediately when team members leave."
      }
    },
    {
      "@type": "Question",
      "name": "How do API keys get exposed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "API keys most often get exposed through accidental commits to public repositories, hardcoded values in client-side code, or logging sensitive request headers. Automated secret scanning catches these before they ship."
      }
    },
    {
      "@type": "Question",
      "name": "What is the best way to store API keys securely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Store API keys in environment variables at minimum. For production systems, use a dedicated secrets manager like AWS Secrets Manager, HashiCorp Vault, or your cloud provider's native solution. Never store keys in application code or database fields."
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
            <span className="rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error border border-error/20">
              Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            API Key Management: How to Store, Rotate, and Protect Your Keys
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400 article-lede">
            API keys are the most commonly leaked credential in production systems. They end up in
            GitHub repos, log files, Slack messages, and browser history. Here&apos;s how to manage
            them so a single exposure doesn&apos;t become a breach.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-02-12">February 12, 2026</time>
            <span>·</span>
            <span>8 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            Every week, thousands of API keys are accidentally committed to public repositories.
            GitHub&apos;s secret scanning catches millions of exposed credentials per year . and that&apos;s
            only the public repos. The private repo leaks, Slack paste jobs, and screenshot
            accidents never get counted. API key management isn&apos;t glamorous, but it&apos;s one of the
            highest-ROI security practices a small team can adopt.
          </p>

          <h2>Why API Keys Are So Frequently Exposed</h2>
          <p>
            The problem isn&apos;t that developers are careless . it&apos;s that the path of least
            resistance leads to insecurity. You need a Stripe key to test locally. You paste it
            into <code>.env</code>. You forget <code>.env</code> isn&apos;t in <code>.gitignore</code>.
            You commit. The key is now in git history forever, even after you delete the file.
          </p>
          <p>
            Or you hardcode the key into a config file to debug a production issue quickly. Or
            you include it in a log statement to trace a request. Or you paste it into a Slack
            message to share with a teammate. Each of these is a vector. Each of them happens
            constantly.
          </p>

          <h2>The .env File Problem</h2>
          <p>
            <code>.env</code> files are the standard solution for keeping secrets out of code .
            and they work, when you remember to exclude them. The issue is human error at the
            worst possible time: when you&apos;re setting up a new project, moving fast, and not
            thinking about gitignore configuration.
          </p>
          <p>
            Best practices for <code>.env</code> files:
          </p>
          <ul>
            <li>
              Always include <code>.env</code>, <code>.env.local</code>, <code>.env.production</code>,
              and <code>.env.*.local</code> in <code>.gitignore</code> <em>before</em> your first
              commit
            </li>
            <li>
              Commit a <code>.env.example</code> file with placeholder values . this documents
              required variables without exposing secrets
            </li>
            <li>
              Run <code>git rm --cached .env</code> if a <code>.env</code> file was accidentally
              staged, and use BFG Repo Cleaner or <code>git filter-branch</code> to purge it from
              history
            </li>
            <li>
              Use pre-commit hooks (like <code>detect-secrets</code> or{" "}
              <code>git-secrets</code>) to scan for secret patterns before allowing commits
            </li>
          </ul>
          <p>
            Important: deleting a file from git does not remove it from history. If a key was
            ever committed, treat it as compromised. Rotate it immediately, even if the repo
            is private.
          </p>

          <h2>How to Store API Keys Securely</h2>
          <p>
            The right storage mechanism depends on your environment:
          </p>
          <h3>Local development</h3>
          <p>
            <code>.env.local</code> files, never committed. For team environments, a shared
            secrets manager (see below) is better than sharing <code>.env</code> files over Slack.
          </p>
          <h3>CI/CD pipelines</h3>
          <p>
            Use your CI provider&apos;s native secrets storage: GitHub Actions Secrets, GitLab CI
            Variables, CircleCI Environment Variables. Never hardcode keys in workflow files.
            Mask secret values in logs. Use short-lived tokens where possible.
          </p>
          <h3>Production environments</h3>
          <p>
            Platform environment variables (Vercel, Railway, Render, Fly.io) are acceptable for
            simple setups. For anything handling sensitive customer data or at significant scale,
            use a dedicated secrets manager:
          </p>
          <ul>
            <li>
              <strong>AWS Secrets Manager / Parameter Store</strong> . IAM-controlled, rotation
              built in, audit trail. Standard choice for AWS deployments.
            </li>
            <li>
              <strong>HashiCorp Vault</strong> . Self-hosted or HCP Vault. Extremely flexible,
              supports dynamic secrets. Higher operational complexity.
            </li>
            <li>
              <strong>Doppler</strong> . Developer-friendly SaaS secrets manager. Simple sync to
              multiple environments. Good for small teams that want structure without Vault&apos;s
              complexity.
            </li>
            <li>
              <strong>1Password Secrets Automation</strong> . Good if your team already uses
              1Password. Integrates with CI/CD and local dev.
            </li>
          </ul>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Check if your API is leaking keys or sensitive data
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scantient scans your live API from the outside . catching exposed secrets, open
              endpoints, and misconfigured headers. Free, no signup.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>API Key Rotation Policies</h2>
          <p>
            Rotation is the practice of replacing an existing API key with a new one on a
            defined schedule . or immediately after a suspected exposure. The goal is to limit
            the useful lifetime of any key that might be compromised without your knowledge.
          </p>
          <p>
            Rotation cadence guidelines by key type:
          </p>
          <ul>
            <li>
              <strong>Payment processor keys (Stripe, etc.):</strong> Rotate every 90 days.
              Immediately on any developer departure or team change.
            </li>
            <li>
              <strong>Internal service-to-service keys:</strong> Every 30–90 days, or use
              short-lived tokens from an auth service instead of static keys.
            </li>
            <li>
              <strong>Third-party SaaS integrations:</strong> Every 180 days. Maintain an
              inventory . rotate what you actually use, audit what you&apos;ve forgotten about.
            </li>
            <li>
              <strong>After any team member leaves:</strong> Rotate all keys that person had
              access to. No exceptions.
            </li>
          </ul>
          <p>
            Rotation is only practical if your deployment supports it without downtime. This means
            keeping secrets in environment variables or a secrets manager . not hardcoded in
            application config that requires a rebuild to update.
          </p>

          <h2>Key Scoping and Least Privilege</h2>
          <p>
            Most API platforms let you create keys with limited permissions. A key for your
            analytics dashboard doesn&apos;t need write access to payment methods. A key for a
            webhook receiver doesn&apos;t need access to user data exports.
          </p>
          <p>
            Scoping rules:
          </p>
          <ul>
            <li>Create one key per integration, not one key for everything</li>
            <li>Grant only the permissions each integration actually needs</li>
            <li>Use IP allowlists where the API provider supports it</li>
            <li>Use separate keys for development and production . never share them</li>
            <li>Document what each key is for; undocumented keys get forgotten</li>
          </ul>
          <p>
            The blast radius of a compromised key is limited by its scope. A leaked read-only
            analytics key is a nuisance. A leaked admin key with billing access is a crisis.
          </p>

          <h2>Exposure Detection</h2>
          <p>
            Detection is the safety net for when prevention fails. Several tools can help:
          </p>
          <ul>
            <li>
              <strong>GitHub Secret Scanning:</strong> Automatically scans public repos and
              notifies API providers when their key patterns are detected. Many providers (Stripe,
              Twilio, AWS) are enrolled. Free for public repos; available on GitHub Advanced
              Security for private repos.
            </li>
            <li>
              <strong>GitGuardian:</strong> Monitors both public GitHub activity and your own
              repos for secret patterns. Alerts in near-real-time.{" "}
              <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">
                Accidental secret commits are one of the most common API security mistakes
              </Link>{" "}
              we see in startup codebases.
            </li>
            <li>
              <strong>Trufflehog:</strong> Open-source tool for scanning git history for secrets.
              Run it on your repos periodically.
            </li>
            <li>
              <strong>API provider alerts:</strong> Enable anomaly detection and unusual usage
              alerts from your API providers. Sudden spikes in usage from unexpected IPs are a
              key exposure signal.
            </li>
          </ul>

          <h2>What to Do When a Key Is Exposed</h2>
          <p>
            Speed matters. The window between exposure and exploitation can be minutes.
          </p>
          <ol>
            <li>
              <strong>Revoke the key immediately.</strong> Don&apos;t wait to understand the full
              scope . revoke first, investigate second.
            </li>
            <li>
              <strong>Issue a replacement key</strong> and update all systems that depend on it.
            </li>
            <li>
              <strong>Check usage logs</strong> for the compromised key. Look for unusual
              geographic locations, volumes, or endpoints accessed.
            </li>
            <li>
              <strong>Determine scope of exposure:</strong> Was the key in a public repo? A
              private one? A log file? Each has different blast radius implications.
            </li>
            <li>
              <strong>Purge from git history</strong> if it was committed. Use BFG Repo Cleaner:
              <code>bfg --replace-text secrets.txt your-repo.git</code>
            </li>
            <li>
              <strong>Post-mortem:</strong> How did this happen? Update your <code>.gitignore</code>,
              pre-commit hooks, and team practices to prevent recurrence.
            </li>
          </ol>

          <h2>API Key Management Checklist</h2>
          <ul>
            <li>✅ <code>.env</code> files excluded from git before first commit</li>
            <li>✅ <code>.env.example</code> committed with placeholder values</li>
            <li>✅ Pre-commit hooks scanning for secret patterns</li>
            <li>✅ Production secrets in a secrets manager or platform env vars</li>
            <li>✅ One key per integration, least-privilege scopes applied</li>
            <li>✅ Separate keys for dev and production</li>
            <li>✅ Rotation schedule documented and enforced</li>
            <li>✅ GitHub Secret Scanning or GitGuardian monitoring active</li>
            <li>✅ Incident response plan for key exposure (revoke → replace → audit → purge)</li>
          </ul>

          <p>
            For a broader look at the API security vulnerabilities that follow from poor key
            management,{" "}
            <Link href="/blog/api-security-complete-guide" className="text-prussian-blue-600 hover:underline">
              read the complete API security guide
            </Link>
            .
          </p>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            External security scan catches exposed endpoints, misconfigured headers, and API key
            leakage. No signup. No SDK.
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
