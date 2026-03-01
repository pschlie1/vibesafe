/**
 * GitHub Issues integration.
 * Creates issues from security findings using the GitHub REST API v3.
 */

const GITHUB_API_URL = "https://api.github.com";

export async function createGitHubIssue(
  config: {
    owner: string;
    repo: string;
    token: string;
  },
  finding: {
    title: string;
    description: string;
    severity: string;
    fixPrompt: string;
    code: string;
  },
  dashboardUrl: string,
): Promise<{ issueUrl: string; issueNumber: number } | null> {
  const severityLower = finding.severity.toLowerCase();

  const body = [
    `## Security Finding: ${finding.title}`,
    "",
    `**Severity:** ${finding.severity}`,
    `**Code:** \`${finding.code}\``,
    "",
    "### Description",
    finding.description,
    "",
    "### Fix Guidance",
    finding.fixPrompt,
    "",
    "---",
    `[View in Scantient Dashboard](${dashboardUrl})`,
    "",
    `*Reported by [Scantient](https://scantient.com) — automated security monitoring*`,
  ].join("\n");

  const labels = ["security", "scantient", severityLower];

  try {
    const res = await fetch(`${GITHUB_API_URL}/repos/${config.owner}/${config.repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: `[Scantient] ${finding.title} (${finding.severity})`,
        body,
        labels,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[github-issues] Failed to create issue:", res.status, text);
      return null;
    }

    const data = (await res.json()) as { html_url?: string; number?: number };
    if (!data.html_url || !data.number) return null;

    return { issueUrl: data.html_url, issueNumber: data.number };
  } catch (err) {
    console.error("[github-issues] Error creating issue:", err);
    return null;
  }
}
