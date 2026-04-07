/**
 * Scantient Security Gate - GitHub Action
 *
 * Calls the Scantient CI Gate API, logs findings to the Actions console,
 * sets step outputs, and fails the step when findings exceed the threshold.
 */

import * as core from "@actions/core";
import * as https from "https";
import * as http from "http";
import { URL } from "url";

interface Finding {
  id: string;
  code: string;
  title: string;
  severity: string;
  description: string;
  fixPrompt: string;
}

interface GateResponse {
  passed: boolean;
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  totalFindings: number;
  findings: Finding[];
  reportUrl: string;
  error?: string;
  upgradeUrl?: string;
}

function fetchJson(urlStr: string, body: object, timeoutMs: number): Promise<{ status: number; data: GateResponse }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const payload = JSON.stringify(body);

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "User-Agent": "scantient-github-action/1.0",
      },
    };

    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode ?? 0, data: JSON.parse(raw) as GateResponse });
        } catch {
          reject(new Error(`Failed to parse response: ${raw.slice(0, 200)}`));
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function severityIcon(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL": return "🔴";
    case "HIGH": return "🟠";
    case "MEDIUM": return "🟡";
    default: return "🔵";
  }
}

function printFindingsTable(findings: Finding[]): void {
  if (findings.length === 0) return;

  core.info("");
  core.info("┌─────────────────────────────────────────────────────────────────────────────┐");
  core.info("│  Findings detected by Scantient                                             │");
  core.info("├──────────┬──────────────────────────────────────────────────────────────────┤");
  core.info("│ Severity │ Finding                                                          │");
  core.info("├──────────┼──────────────────────────────────────────────────────────────────┤");

  for (const f of findings) {
    const icon = severityIcon(f.severity);
    const sev = `${icon} ${f.severity.padEnd(8)}`;
    const title = f.title.substring(0, 58).padEnd(58);
    core.info(`│ ${sev} │ ${title} │`);
    if (f.fixPrompt) {
      const fix = `Fix: ${f.fixPrompt}`.substring(0, 64).padEnd(64);
      core.info(`│          │ ${fix}      │`);
    }
  }

  core.info("└──────────┴──────────────────────────────────────────────────────────────────┘");
  core.info("");
}

async function run(): Promise<void> {
  try {
    const apiKey = core.getInput("api-key", { required: true });
    const url = core.getInput("url", { required: true });
    const failOn = core.getInput("fail-on") || "critical";
    const timeoutSecs = parseInt(core.getInput("timeout") || "60", 10);
    const apiBaseUrl = core.getInput("api-base-url") || "https://scantient.com";

    // Validate inputs
    if (!["critical", "high", "medium"].includes(failOn.toLowerCase())) {
      core.setFailed(`Invalid fail-on value: "${failOn}". Valid values: critical, high, medium`);
      return;
    }

    core.info(`Scantient Security Gate`);
    core.info(`Scanning: ${url}`);
    core.info(`Fail on: ${failOn} or higher`);
    core.info(`Timeout: ${timeoutSecs}s`);
    core.info("");

    const gateUrl = `${apiBaseUrl}/api/public/ci-gate`;
    const requestBody = { apiKey, url, failOn: failOn.toLowerCase() };

    let result: { status: number; data: GateResponse };
    try {
      result = await fetchJson(gateUrl, requestBody, timeoutSecs * 1000);
    } catch (err) {
      core.setFailed(`Scan request failed: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    const { status, data } = result;

    // Handle error responses
    if (status === 401) {
      core.setFailed("Authentication failed. Check your SCANTIENT_API_KEY secret.");
      return;
    }
    if (status === 403) {
      core.setFailed(
        `${data.error ?? "Forbidden"}${data.upgradeUrl ? ` Upgrade at: ${data.upgradeUrl}` : ""}`,
      );
      return;
    }
    if (status === 429) {
      core.warning("Scan rate limit reached. Skipping scan for this run.");
      core.setOutput("passed", "true");
      core.setOutput("score", "0");
      return;
    }
    if (status >= 500) {
      core.setFailed(`Scantient service error (${status}). Please try again.`);
      return;
    }

    // Set outputs
    core.setOutput("passed", String(data.passed));
    core.setOutput("score", String(data.score));
    core.setOutput("report-url", data.reportUrl ?? "");
    core.setOutput("critical-count", String(data.criticalCount ?? 0));
    core.setOutput("high-count", String(data.highCount ?? 0));
    core.setOutput("total-findings", String(data.totalFindings ?? 0));

    // Log summary
    core.info(`Security score: ${data.score}/100`);
    core.info(`Findings: ${data.totalFindings} total (${data.criticalCount} critical, ${data.highCount} high, ${data.mediumCount} medium)`);

    if (data.reportUrl) {
      core.info(`Full report: ${data.reportUrl}`);
    }

    // Print findings table
    if ((data.findings ?? []).length > 0) {
      printFindingsTable(data.findings);
    }

    if (!data.passed) {
      core.error(`Security gate failed. ${data.criticalCount > 0 ? `${data.criticalCount} critical` : ""} ${data.highCount > 0 ? `${data.highCount} high` : ""} finding(s) detected.`);
      core.error(`Review and fix these findings before merging. Full report: ${data.reportUrl}`);
      core.setFailed(`Scantient security gate blocked this merge. Score: ${data.score}/100. See findings above.`);
    } else {
      core.info(`Security gate passed. No ${failOn} or higher findings detected.`);
    }
  } catch (err) {
    core.setFailed(err instanceof Error ? err.message : String(err));
  }
}

run();
