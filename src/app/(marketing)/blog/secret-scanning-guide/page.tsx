import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Complete Guide to Secret Scanning & Credential Detection (2026) | Scantient",
  description:
    "Learn how secret scanning protects your codebase from exposed API keys, credentials, and secrets. Tool comparison: Scantient vs GitGuardian vs Snyk vs Checkmarx.",
  keywords:
    "secret scanning, credential detection, API key security, secrets management, GitGuardian alternative, secret leak prevention, git security, CI/CD security",
  openGraph: {
    title: "The Complete Guide to Secret Scanning & Credential Detection (2026)",
    description:
      "How secrets get exposed in code. How to detect them. How to prevent them. Tool comparison for developers and DevSecOps engineers.",
    url: "https://scantient.com/blog/secret-scanning-guide",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-22T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Complete Guide to Secret Scanning & Credential Detection (2026)",
    description:
      "Secret scanning explained: how API keys leak, how to detect them before they're exploited, and which tool fits your team.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Complete Guide to Secret Scanning & Credential Detection (2026)",
  description:
    "Comprehensive guide to secret scanning: what it is, how secrets leak, detection methods, tool comparison, and implementation strategies for developers and DevSecOps teams.",
  datePublished: "2026-03-22T00:00:00Z",
  dateModified: "2026-03-22T00:00:00Z",
  author: { "@type": "Person", "name": "Peter Schliesmann", "url": "https://scantient.com/about", "jobTitle": "Founder", "sameAs": ["https://www.linkedin.com/in/peterschliesmann"] },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/secret-scanning-guide",
  mainEntityOfPage: "https://scantient.com/blog/secret-scanning-guide",
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
      name: "The Complete Guide to Secret Scanning & Credential Detection (2026)",
      item: "https://scantient.com/blog/secret-scanning-guide",
    },
  ],
};

export default function SecretScanningGuidePage() {
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
      "name": "What is secret scanning?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Secret scanning automatically detects credentials, API keys, tokens, and other sensitive values that have been accidentally committed to source code. It prevents exposed secrets from reaching public repositories or production systems."
      }
    },
    {
      "@type": "Question",
      "name": "What types of secrets do scanners detect?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Secret scanners detect API keys, OAuth tokens, private keys, database connection strings, passwords, AWS credentials, Stripe keys, GitHub tokens, and other credential patterns. Good scanners use regex patterns and entropy analysis to minimize false negatives."
      }
    },
    {
      "@type": "Question",
      "name": "What should I do if a secret is found in my repository?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Revoke and rotate the secret immediately — do not just delete the commit. The secret may already be in git history or cached by external systems. After rotating, remove it from git history using tools like git-filter-repo, and add the pattern to your secret scanner's blocklist."
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
            <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning border border-warning/20">
              Security Fundamentals
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            The Complete Guide to Secret Scanning & Credential Detection (2026)
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400 article-lede">
            API keys. Database passwords. Private encryption keys. OAuth tokens. One exposed
            credential gives an attacker full access to your infrastructure. Learn how they leak,
            how to find them before they&apos;re exploited, and which tools work.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-22">March 22, 2026</time>
            <span>·</span>
            <span>18 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-invert max-w-none dark:prose-invert prose-headings:text-ink-black-950 dark:prose-headings:text-alabaster-grey-50 prose-a:text-prussian-blue-600 dark:prose-a:text-prussian-blue-400 prose-strong:text-ink-black-950 dark:prose-strong:text-alabaster-grey-100 prose-code:text-red-600 dark:prose-code:text-red-400 prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950">
          <h2>What Is Secret Scanning? Why It Matters</h2>

          <p>
            Secret scanning is automated detection of leaked credentials in source code, git
            history, CI/CD logs, and configuration files. It looks for patterns that match API
            keys, database passwords, private keys, OAuth tokens, and other sensitive strings that
            must never be committed to version control.
          </p>

          <p>
            The scope sounds simple. The impact is massive. A single exposed AWS secret key costs
            $10,000+ in cryptomining charges on your account before you notice. A leaked
            database password gives an attacker direct access to your customer data. A Stripe API
            key in git history is an open door to refunding transactions or accessing payment data.
          </p>

          <h3>Real Examples</h3>

          <p>
            In 2023, a GitHub user accidentally committed AWS credentials to a public repo. Within
            hours, attackers found it via automated scanning and launched cryptominers on the
            associated infrastructure. The bill: $48,000 before AWS rate-limited the account.
          </p>

          <p>
            CircleCI experienced a 2023 breach where attackers accessed customer API tokens stored
            in environment variables. The tokens were never committed to git, but they were logged
            during CI/CD failures, and those logs were accessible to anyone with a CircleCI account.
          </p>

          <p>
            More common: a developer testing payment integration adds `stripe_api_key = "sk_live_..."` to
            a Python config file, commits it, then removes it five commits later. The commit history
            still contains the key. A secret scanner catches this in development. Without one, someone
            finds it via a GitHub search eight months later.
          </p>

          <h3>The Cost of a Single Exposure</h3>

          <p>
            Assuming an attacker finds a single exposed credential:
          </p>

          <ul>
            <li>
              <strong>Time to detection:</strong> Hours or days (if you notice at all)
            </li>
            <li>
              <strong>Immediate damage:</strong> $100 to $100,000 depending on the credential
              (cryptomining, unauthorized API calls, data theft)
            </li>
            <li>
              <strong>Operational cost:</strong> Revoking the credential, rotating it in production,
              updating all systems that reference it, auditing logs to see what was accessed
            </li>
            <li>
              <strong>Notification and compliance:</strong> If PII was accessed, you'll need to
              notify affected users, file breach reports, and document incident response
            </li>
            <li>
              <strong>Reputation damage:</strong> Security breaches erode customer trust
            </li>
          </ul>

          <p>
            A secret scanning tool finds this in seconds. It costs nothing compared to incident
            response.
          </p>

          <h2>How Secrets Get Exposed</h2>

          <h3>1. Accidental Git Commits</h3>

          <p>
            The most common vector. A developer adds API keys to code while testing, forgets to
            remove them, and pushes to a branch. Even if the commit is deleted later, it lives in
            git history unless the repo is completely scrubbed (which requires rewriting all refs and removing the branch history).
          </p>

          <p>
            Example: A config file with hardcoded database credentials.
          </p>

          <pre>
            <code>{`// config/database.js
const db = {
  host: "db.acme.com",
  user: "admin",
  password: "prod-db-password-here", // Oops
};`}</code>
          </pre>

          <h3>2. CI/CD Pipeline Logs</h3>

          <p>
            Build logs are printed to stdout. Secrets leak when debugging environment
            variables, printing request payloads, or logging error messages. GitLab, GitHub
            Actions, and CircleCI all store logs that are searchable and accessible by team members.
          </p>

          <p>
            Example: A GitHub Actions workflow runs a curl command with an API key for debugging, then
            fails. The full command (with key) is logged and visible in the run output.
          </p>

          <h3>3. Environment Variable Misconfigurations</h3>

          <p>
            `.env` files must never be committed, but `.env.example` often is. If someone copies
            `.env.example` and fills in real secrets, then accidentally commits the result, it's exposed.
            Similarly, Docker builds often bake secrets into Dockerfile ARGs or ENV statements.
          </p>

          <h3>4. Third-Party Dependencies</h3>

          <p>
            A dependency library might be compromised or malicious. It reads your environment
            variables and exfiltrates them during install (common attack vector). Or, a library
            logs all HTTP requests including headers, exposing Authorization tokens.
          </p>

          <h3>5. Developer Carelessness in Logs</h3>

          <p>
            A developer catches an exception, logs the full request/response to debug it, and
            forgets that the request contained an Authorization header with a bearer token. Now it's in your
            log aggregation system, accessible to anyone with log access.
          </p>

          <h3>6. Uploaded Files and Configuration</h3>

          <p>
            `kubectl` configs, AWS credentials files, SSH keys, and other sensitive files are
            sometimes checked into repos by accident or uploaded to cloud storage (S3 buckets,
            GCS) with overly permissive access.
          </p>

          <h2>How Secret Scanning Works</h2>

          <p>
            Secret scanning tools use three main techniques:
          </p>

          <h3>1. Pattern Matching (Regex + Entropy)</h3>

          <p>
            The tool searches for known patterns: strings that look like AWS keys (start with
            `AKIA`), GitHub tokens (ghp_), Stripe keys (sk_live_, pk_live_), etc. Modern scanners
            also check entropy. If a string has high randomness and appears in contexts where secrets
            typically appear, it's flagged.
          </p>

          <p>
            Advantage: Fast, low false negatives (rarely misses real secrets). Disadvantage: High false
            positives (flags random strings that aren't actually secrets).
          </p>

          <h3>2. Git History Scanning</h3>

          <p>
            The tool clones or accesses your repo and scans every commit in history. This catches
            secrets that were committed months ago but never cleaned up. Tools like TruffleHog
            search git objects directly without checking out the full history.
          </p>

          <h3>3. Pre-Commit Hooks & CI/CD Integration</h3>

          <p>
            Secrets are caught before they hit the remote repo. A pre-commit hook runs locally
            before `git commit` and blocks the commit if secrets are detected. CI/CD integration
            scans on every push and fails the build if secrets are found.
          </p>

          <p>
            The advantage: catches secrets before they're shared. The disadvantage: developers will
            bypass hooks with `git commit --no-verify`, and this requires every developer to have
            the hook installed.
          </p>

          <h3>4. API Monitoring & Scanning Service</h3>

          <p>
            Services like Scantient scan your production APIs from the outside, looking for
            misconfigured secrets exposure endpoints. While not the same as code-based secret
            scanning, they catch secrets that made it through your development pipeline and are
            now accessible in production (via logs, error pages, or API responses).
          </p>

          <h2>Tool Comparison: Scantient vs GitGuardian vs Snyk vs Checkmarx</h2>

          <p>
            Each tool focuses on different parts of the problem. Here's an honest breakdown:
          </p>

          <h3>GitGuardian</h3>

          <p>
            <strong>What it does:</strong> Specialized secrets detection. Monitors git commits and
            CI/CD pipelines for leaked credentials.
          </p>

          <p>
            <strong>Coverage:</strong> 350+ secret patterns (API keys, database credentials, SSH
            keys, OAuth tokens, encryption keys). Scans git history and new commits in real-time.
          </p>

          <p>
            <strong>Strengths:</strong> Purpose-built for secret detection. Excellent pattern
            library. Free for public repos. Integrates with GitHub, GitLab, Bitbucket, Azure DevOps.
          </p>

          <p>
            <strong>Weaknesses:</strong> Doesn't scan running production APIs. Won't show what
            attackers exploited. Some false positives (flags test strings that aren't real
            secrets).
          </p>

          <p>
            <strong>Pricing:</strong> Free for public repos. ~$25/dev/month for private repos and
            continuous monitoring.
          </p>

          <p>
            <strong>Best for:</strong> Teams where preventing code leaks is the priority. Essential
            if you're managing open-source repos.
          </p>

          <h3>Snyk</h3>

          <p>
            <strong>What it does:</strong> Dependency vulnerability scanning (SCA) + source code
            analysis (SAST). It detects secrets, but its focus is elsewhere.
          </p>

          <p>
            <strong>Coverage:</strong> Open-source dependencies, source code vulnerabilities,
            container images, IaC configs. Secret detection is included but less sophisticated
            than GitGuardian.
          </p>

          <p>
            <strong>Strengths:</strong> Market leader for dependency scanning. Excellent for
            catching vulnerable libraries. Deep code analysis. Good GitHub integration with
            automatic PR checks.
          </p>

          <p>
            <strong>Weaknesses:</strong> Overkill if you only care about secrets. Doesn't scan
            production APIs. Enterprise pricing for advanced features.
          </p>

          <p>
            <strong>Pricing:</strong> Free tier for open source. Paid plans ~$25/dev/month. Enterprise
            requires sales calls.
          </p>

          <p>
            <strong>Best for:</strong> Teams with complex dependencies and compliance requirements.
            Essential for Series A+ teams managing many libraries.
          </p>

          <h3>Checkmarx</h3>

          <p>
            <strong>What it does:</strong> Enterprise SAST platform. Deep source code analysis across
            35+ languages.
          </p>

          <p>
            <strong>Coverage:</strong> Code-level vulnerabilities, business logic flaws, secrets in
            code.
          </p>

          <p>
            <strong>Strengths:</strong> Best-in-class SAST analysis. Handles large, complex
            codebases. Strong compliance features for enterprises.
          </p>

          <p>
            <strong>Weaknesses:</strong> Overkill for startups. Expensive. Not focused on secrets or
            runtime API security. Requires code access and long setup times.
          </p>

          <p>
            <strong>Pricing:</strong> Enterprise (five figures minimum). Not relevant for most indie
            devs and small teams.
          </p>

          <p>
            <strong>Best for:</strong> Large enterprises with mature security programs and compliance
            mandates.
          </p>

          <h3>Scantient</h3>

          <p>
            <strong>What it does:</strong> External API security scanning. Tests your production
            APIs from the outside, detecting exposed secrets, misconfigured security headers, auth
            bypasses, and other runtime vulnerabilities.
          </p>

          <p>
            <strong>Coverage:</strong> Your running production API. Checks for exposed secrets in
            error pages, logs, API responses, headers. Validates security posture without code
            access.
          </p>

          <p>
            <strong>Strengths:</strong> Zero setup required. No code access needed. Free scan shows
            results in 60 seconds. Catches secrets that made it to production despite other tools.
            Lifetime deal at $79 is indie-dev friendly. Continuous monitoring for compliance.
          </p>

          <p>
            <strong>Weaknesses:</strong> Doesn't scan git history or your source code. Can't catch
            secrets before they're deployed. Focused on external attack surface, not internal code
            analysis.
          </p>

          <p>
            <strong>Pricing:</strong> Free scan. Continuous monitoring from $79 lifetime deal
            (Maker tier) to $399/mo (Team Lead).
          </p>

          <p>
            <strong>Best for:</strong> Founders and DevSecOps teams who want to know what attackers
            see when they target your production API. First line of defense for anyone without a
            dedicated security team.
          </p>

          <h2>How to Implement Secret Scanning in Your CI/CD</h2>

          <h3>GitHub Actions Setup</h3>

          <p>Add this workflow to `.github/workflows/secret-scan.yml`:</p>

          <pre>
            <code>
{`name: Secret Scanning
on: [push, pull_request]
jobs:
  trufflesecurity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Scan all history
      - name: TruffleHog Secret Scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: \${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --debug --json`}
            </code>
          </pre>

          <p>This runs on every push and PR. If secrets are found, the build fails.</p>

          <h3>GitLab CI Setup</h3>

          <p>Add to `.gitlab-ci.yml`:</p>

          <pre>
            <code>{`secret_scan:
  stage: security
  image: python:3.10
  script:
    - pip install detect-secrets
    - detect-secrets scan --all-files --force-use-all-plugins > baseline.json
    - detect-secrets audit baseline.json
  allow_failure: false`}</code>
          </pre>

          <h3>Local Pre-Commit Hook</h3>

          <p>Install `husky` and `detect-secrets`:</p>

          <pre>
            <code>{`npm install husky detect-secrets --save-dev
npx husky install
npx husky add .husky/pre-commit "detect-secrets scan --all-files"`}</code>
          </pre>

          <p>
            Now developers won't commit secrets locally. Note: they will bypass with
            `git commit --no-verify`, so this is a speed bump, not a wall.
          </p>

          <h3>What to Do When Secrets Are Found</h3>

          <ol>
            <li>
              <strong>Immediately revoke the secret</strong> . Delete API keys, regenerate
              passwords, rotate tokens. Never remove it from code alone.
            </li>
            <li>
              <strong>Check logs to see if it was used.</strong> If found in git history, assume
              it was accessed. Check your monitoring/audit logs for suspicious activity.
            </li>
            <li>
              <strong>Rewrite git history</strong> if the secret was in commits. Use
              `git-filter-branch` or `BFG Repo Cleaner` to remove it from all commits.
            </li>
            <li>
              <strong>Update your team.</strong> If it was a shared credential (database password),
              notify everyone who has access.
            </li>
            <li>
              <strong>Document the incident.</strong> Keep records for audit/compliance purposes.
            </li>
          </ol>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Find exposed secrets before attackers do
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Scan your production API right now. See what's exposed. No setup required.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Free in 60 Seconds →
            </Link>
          </div>

          <h2>Best Practices for Secret Management</h2>

          <h3>1. Use Environment Variables (Never Hardcode)</h3>

          <p>Store secrets in environment variables. Never hardcode them in code:</p>

          <pre>
            <code>{`// Good
const apiKey = process.env.STRIPE_API_KEY;

// Bad
const apiKey = "sk_live_abc123..."; // Never do this`}</code>
          </pre>

          <h3>2. Use a Secrets Vault for Production</h3>

          <p>
            For production systems, use a dedicated secrets manager such as HashiCorp Vault, AWS Secrets
            Manager, Google Secret Manager, or Azure Key Vault. These systems:
          </p>

          <ul>
            <li>Store secrets encrypted at rest</li>
            <li>Control access with fine-grained permissions</li>
            <li>Audit every access (who read the secret, when)</li>
            <li>Support automatic rotation</li>
            <li>Integrate with CI/CD pipelines</li>
          </ul>

          <h3>3. Implement Secret Rotation</h3>

          <p>
            Rotate API keys, database passwords, and OAuth tokens on a regular schedule (quarterly
            minimum, monthly for high-risk systems). If a secret is compromised, rotation limits
            the window of exploitation.
          </p>

          <h3>4. Principle of Least Privilege</h3>

          <p>
            Each secret will have the minimum permissions needed. A webhook handler doesn't need
            a database admin password. Use scoped API keys: a payment processing key permits charges only,
            not refunds.
          </p>

          <h3>5. Educate Your Team</h3>

          <p>
            The best tool is useless if developers don't understand why secrets matter. Conduct training on:
          </p>

          <ul>
            <li>What counts as a secret (API keys, database passwords, private keys, tokens)</li>
            <li>How to use `.gitignore` and `.env` files</li>
            <li>How to generate and rotate secrets safely</li>
            <li>What to do if they accidentally commit a secret</li>
          </ul>

          <h2>FAQ</h2>

          <h3>1. What's the difference between secret scanning and dependency scanning?</h3>
          <p>
            Secret scanning looks for hardcoded credentials in code. Dependency scanning (SCA) looks
            for vulnerabilities in third-party libraries. Both are important. Use both.
          </p>

          <h3>2. How to prevent false positives in secret scanning</h3>
          <p>
            Good tools use entropy checks and context analysis to reduce false positives. But some
            false positives are inevitable (test strings that look like secrets). Most tools let you
            allowlist benign patterns or specific files.
          </p>

          <h3>3. If a secret is in git history, is it safe to remove it from the latest commit?</h3>
          <p>
            No. Git history is public (usually). Even if you remove it from the latest commit, anyone
            who cloned the repo before the removal has access to the entire history, including the
            secret. You must rewrite git history using `git filter-branch` or `BFG Repo Cleaner`.
          </p>

          <h3>4. Scan all branches or the main branch only?</h3>
          <p>
            Scan all branches. Secrets hide in feature branches for months. Scan on every push,
            not only in PRs.
          </p>

          <h3>5. What if someone commits a secret by accident, then removes it in the next commit?</h3>
          <p>
            The secret still exists in git history. The removal doesn't help. History is immutable
            unless rewritten. A pre-commit hook would have prevented the first commit entirely.
          </p>

          <h3>6. How often to scan for secrets</h3>
          <p>
            Continuously. On every commit, on every push, and periodically scan historical commits.
            Most tools do this automatically when integrated with GitHub/GitLab.
          </p>

          <h3>7. What if my tool finds a secret that&apos;s not actually used (like in a comment)?</h3>
          <p>
            Treat it as a secret anyway. Even if it's not active today, it's a liability. Better to
            be safe and remove it.
          </p>

          <h3>8. How do I store secrets in GitHub?</h3>
          <p>
            Yes, GitHub and GitLab both provide secure secret storage for CI/CD. Environment
            variables injected at runtime are not logged or exposed in your code.
          </p>

          <h3>9. What about secrets in Docker images?</h3>
          <p>
            Never bake secrets into Docker images. Use multi-stage builds to avoid secrets in final
            layers. Pass secrets at runtime via environment variables or secrets managers.
          </p>

          <h3>10. Is Scantient the same as GitGuardian?</h3>
          <p>
            No. GitGuardian scans your code and git history for secrets. Scantient scans your
            production APIs from the outside. You need both: GitGuardian prevents secrets from
            entering code, Scantient catches what makes it through to production.
          </p>

          <h2>The Complete Secret Scanning Strategy</h2>

          <p>
            A complete secret scanning strategy combines multiple layers:
          </p>

          <ol>
            <li>
              <strong>Pre-commit:</strong> Local hook prevents secrets from being committed
            </li>
            <li>
              <strong>CI/CD:</strong> Pipeline check catches secrets that bypassed the hook
            </li>
            <li>
              <strong>Git history:</strong> GitGuardian monitors for secrets in historical commits
            </li>
            <li>
              <strong>Production API:</strong> Scantient scans your running API for exposed secrets
              and other misconfigurations
            </li>
            <li>
              <strong>Vault monitoring:</strong> Alert on unauthorized access to your secrets
              manager
            </li>
          </ol>

          <p>
            No single tool catches everything. The most mature teams use tools from multiple
            categories because they cover different attack surfaces.
          </p>

          <h2>Get Started Today</h2>

          <p>
            You don't need to implement everything at once. Start with one layer:
          </p>

          <ul>
            <li>
              <strong>This week:</strong> Run Scantient&apos;s free scan on your production API. See
              what's exposed. Takes 60 seconds.
            </li>
            <li>
              <strong>Next week:</strong> Add GitGuardian to your repo if you don&apos;t have secret
              scanning yet. Free for public repos.
            </li>
            <li>
              <strong>Next month:</strong> Add pre-commit hooks for your team. Shift detection left.
            </li>
            <li>
              <strong>Ongoing:</strong> Enable continuous monitoring. Secrets leak incrementally.
              Detection must be continuous as well.
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            See what&apos;s exposed in your production API. No code access, no signup, no setup. The fastest
            way to find secret leaks.
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
            Related Reading
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="/vs-gitguardian" className="text-sm text-prussian-blue-600 hover:underline">
              Scantient vs GitGuardian: Secret Scanning Explained →
            </Link>
            <Link
              href="/blog/what-is-external-security-scanning"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              What Is External Security Scanning? →
            </Link>
            <Link
              href="/blog/api-security-scanner-comparison"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              Best API Security Scanners in 2026 →
            </Link>
            <Link
              href="/blog/devsecops-for-startups"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              DevSecOps for Startups: Security Without the Overhead →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
