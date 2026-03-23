import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GitHub Action Setup | Scantient Docs",
  description:
    "Block merges when security findings are detected. Scantient's GitHub Action integrates directly into your CI/CD pipeline.",
  openGraph: {
    title: "Scantient GitHub Action - CI/CD Security Gate",
    description:
      "Block merges when security findings are detected. Set up in two minutes.",
    url: "https://scantient.com/docs/github-action",
    siteName: "Scantient",
    type: "website",
  },
};

const basicWorkflow = `name: Security Gate

on:
  pull_request:
    branches: [main]

jobs:
  security-scan:
    name: Scantient Security Gate
    runs-on: ubuntu-latest
    steps:
      - name: Run Scantient Security Gate
        uses: scantient/security-gate-action@v1
        with:
          api-key: \${{ secrets.SCANTIENT_API_KEY }}
          url: \${{ vars.APP_URL }}
          fail-on: critical`;

const fullWorkflow = `name: Security Gate (Full)

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main]

jobs:
  security-scan:
    name: Scantient Security Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy preview
        id: deploy
        run: echo "url=https://my-preview.example.com" >> "$GITHUB_OUTPUT"

      - name: Run Scantient Security Gate
        id: scan
        uses: scantient/security-gate-action@v1
        with:
          api-key: \${{ secrets.SCANTIENT_API_KEY }}
          url: \${{ steps.deploy.outputs.url }}
          fail-on: high
          timeout: 90

      - name: Post scan summary
        if: always()
        run: |
          echo "## Security Scan Results" >> $GITHUB_STEP_SUMMARY
          echo "Score: \${{ steps.scan.outputs.score }}/100" >> $GITHUB_STEP_SUMMARY
          echo "Passed: \${{ steps.scan.outputs.passed }}" >> $GITHUB_STEP_SUMMARY
          echo "Critical: \${{ steps.scan.outputs.critical-count }}" >> $GITHUB_STEP_SUMMARY
          echo "[View full report](\${{ steps.scan.outputs.report-url }})" >> $GITHUB_STEP_SUMMARY`;

const steps = [
  {
    step: "1",
    title: "Get your API key",
    content:
      "Log in to Scantient and go to Settings > API Keys. Create a new key with a descriptive name like \"GitHub Actions\". Copy the key — it starts with vs_.",
  },
  {
    step: "2",
    title: "Add the key as a GitHub secret",
    content:
      'In your GitHub repository, go to Settings > Secrets and variables > Actions. Click "New repository secret". Name it SCANTIENT_API_KEY and paste your key.',
  },
  {
    step: "3",
    title: "Add the workflow file",
    content:
      "Create .github/workflows/security-gate.yml in your repository. Use the example below as a starting point.",
  },
  {
    step: "4",
    title: "Open a pull request",
    content:
      "The action runs automatically on every pull request targeting your default branch. It blocks the merge if findings exceed your threshold.",
  },
];

const inputs = [
  {
    name: "api-key",
    required: true,
    default: "",
    description: "Your Scantient API key. Store this as a GitHub secret.",
  },
  {
    name: "url",
    required: true,
    default: "",
    description: "The URL of the deployed application to scan.",
  },
  {
    name: "fail-on",
    required: false,
    default: "critical",
    description:
      "Minimum severity that fails the step. Options: critical, high, medium.",
  },
  {
    name: "timeout",
    required: false,
    default: "60",
    description: "Maximum seconds to wait for the scan to complete.",
  },
  {
    name: "api-base-url",
    required: false,
    default: "https://scantient.com",
    description: "Override the Scantient API base URL. Used for self-hosted instances.",
  },
];

const outputs = [
  { name: "passed", description: "Whether the scan passed the configured threshold (true/false)." },
  { name: "score", description: "Overall security score from 0 to 100." },
  { name: "report-url", description: "URL to the full scan report in the Scantient dashboard." },
  { name: "critical-count", description: "Number of critical findings detected." },
  { name: "high-count", description: "Number of high findings detected." },
  { name: "total-findings", description: "Total number of findings across all severities." },
];

export default function GithubActionDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-heading transition-colors">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-heading transition-colors">Docs</Link>
        <span>/</span>
        <span className="text-heading">GitHub Action</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <span className="inline-block rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
          PRO+
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-heading">
          GitHub Action: Security Gate
        </h1>
        <p className="mt-4 text-lg text-muted">
          Block pull request merges when security findings are detected. Scantient runs a full
          security scan on your deployed app and fails the workflow when findings exceed your
          threshold.
        </p>
        <div className="mt-6 flex gap-4">
          <a
            href="https://github.com/scantient/security-gate-action"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading transition hover:bg-surface-raised"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Get started
          </Link>
        </div>
      </div>

      {/* Setup Steps */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-heading">Setup</h2>
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised border border-border font-bold text-heading">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-heading">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Basic Workflow */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold text-heading">Basic Workflow</h2>
        <p className="mb-4 text-sm text-muted">
          Add this file to <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-xs">.github/workflows/security-gate.yml</code>:
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border bg-surface-raised p-6 text-xs leading-relaxed text-heading">
          <code>{basicWorkflow}</code>
        </pre>
      </section>

      {/* Full Example */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold text-heading">Full Example with Outputs</h2>
        <p className="mb-4 text-sm text-muted">
          This example deploys a preview, scans it, and posts results to the GitHub Actions summary:
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border bg-surface-raised p-6 text-xs leading-relaxed text-heading">
          <code>{fullWorkflow}</code>
        </pre>
      </section>

      {/* Inputs */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold text-heading">Inputs</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-heading">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-heading">Required</th>
                <th className="px-4 py-3 text-left font-semibold text-heading">Default</th>
                <th className="px-4 py-3 text-left font-semibold text-heading">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inputs.map((inp) => (
                <tr key={inp.name} className="bg-surface">
                  <td className="px-4 py-3 font-mono text-xs text-heading">{inp.name}</td>
                  <td className="px-4 py-3 text-muted">{inp.required ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{inp.default || "—"}</td>
                  <td className="px-4 py-3 text-muted">{inp.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Outputs */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold text-heading">Outputs</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-heading">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-heading">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {outputs.map((out) => (
                <tr key={out.name} className="bg-surface">
                  <td className="px-4 py-3 font-mono text-xs text-heading">{out.name}</td>
                  <td className="px-4 py-3 text-muted">{out.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Behavior */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold text-heading">Behavior</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="font-semibold text-heading">Exit codes</h3>
            <p className="mt-2 text-sm text-muted">
              The action exits with code 0 (success) when no findings exceed the threshold. It
              exits with code 1 (failure) when one or more findings meet or exceed the{" "}
              <code className="font-mono text-xs">fail-on</code> severity. GitHub blocks the merge
              on failure.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="font-semibold text-heading">Scan timeout</h3>
            <p className="mt-2 text-sm text-muted">
              The default timeout is 60 seconds. Set{" "}
              <code className="font-mono text-xs">timeout: 90</code> for larger applications. If
              the scan times out, the step fails. Your CI usage is not charged for timed-out scans.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="font-semibold text-heading">Rate limits</h3>
            <p className="mt-2 text-sm text-muted">
              PRO plans allow 50 CI scans per day. Enterprise plans allow 200. The action logs a
              warning and passes through (non-blocking) when the rate limit is reached, to avoid
              blocking your pipeline on billing limits.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="font-semibold text-heading">App auto-registration</h3>
            <p className="mt-2 text-sm text-muted">
              If the scanned URL is not yet registered in Scantient, the action registers it
              automatically (within your plan's app limit). Subsequent scans of the same URL reuse
              the existing app record.
            </p>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold text-heading">Requirements</h2>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-success">✓</span>
            <span>Scantient PRO, Enterprise, or Enterprise Plus plan</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-success">✓</span>
            <span>{"An API key from Settings > API Keys"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-success">✓</span>
            <span>
              A publicly accessible URL for the deployed app (the scan runs from Scantient's servers)
            </span>
          </li>
        </ul>
      </section>

      {/* CTA */}
      <div className="rounded-2xl border border-border bg-surface-raised p-8 text-center">
        <h2 className="text-xl font-bold text-heading">Ready to add a security gate?</h2>
        <p className="mt-2 text-sm text-muted">
          Set up takes about two minutes. PRO plan required.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Start free trial
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted hover:text-heading transition-colors"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
