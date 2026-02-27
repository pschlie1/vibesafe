import { db } from "@/lib/db";
import type { SecurityFinding } from "@/lib/types";

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL ?? "alerts@vibesafe.app";

  if (!key) {
    console.warn("[alerts] RESEND_API_KEY not set. Skipping email.");
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
}

async function sendSlack(webhookUrl: string, text: string) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

async function sendWebhook(url: string, payload: Record<string, unknown>) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;

export async function sendCriticalFindingsAlert(appId: string, findings: SecurityFinding[]) {
  if (!findings.length) return;

  const app = await db.monitoredApp.findUnique({
    where: { id: appId },
    include: { org: true },
  });
  if (!app) return;

  // Get org alert configs
  const configs = await db.alertConfig.findMany({
    where: { orgId: app.orgId, enabled: true },
  });

  if (configs.length === 0) {
    // Fallback: send to app owner directly
    const high = findings.filter((f) => ["HIGH", "CRITICAL"].includes(f.severity));
    if (high.length > 0) {
      const html = buildAlertHtml(app.name, app.url, high);
      await sendEmail(app.ownerEmail, `⚠️ VibeSafe Alert: ${app.name}`, html);
    }
    return;
  }

  for (const config of configs) {
    const minOrder = SEVERITY_ORDER[config.minSeverity as keyof typeof SEVERITY_ORDER] ?? 1;
    const relevant = findings.filter(
      (f) => (SEVERITY_ORDER[f.severity as keyof typeof SEVERITY_ORDER] ?? 3) <= minOrder,
    );

    if (relevant.length === 0) continue;

    try {
      switch (config.channel) {
        case "EMAIL": {
          const html = buildAlertHtml(app.name, app.url, relevant);
          await sendEmail(config.destination, `⚠️ VibeSafe Alert: ${app.name}`, html);
          break;
        }
        case "SLACK": {
          const text = buildSlackMessage(app.name, app.url, relevant);
          await sendSlack(config.destination, text);
          break;
        }
        case "WEBHOOK": {
          await sendWebhook(config.destination, {
            event: "findings.detected",
            app: { id: app.id, name: app.name, url: app.url },
            findings: relevant,
            timestamp: new Date().toISOString(),
          });
          break;
        }
      }

      // Log notification
      await db.notification.create({
        data: {
          alertConfigId: config.id,
          subject: `Alert: ${app.name}`,
          body: `${relevant.length} finding(s) detected`,
          delivered: true,
        },
      });
    } catch (error) {
      await db.notification.create({
        data: {
          alertConfigId: config.id,
          subject: `Alert: ${app.name}`,
          body: `${relevant.length} finding(s) detected`,
          delivered: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
}

function buildAlertHtml(appName: string, appUrl: string, findings: SecurityFinding[]): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px;">
      <h2 style="margin-bottom: 4px;">⚠️ VibeSafe Alert: ${appName}</h2>
      <p style="color: #666; margin-top: 0;">
        <a href="${appUrl}">${appUrl}</a>
      </p>
      <p>We detected <strong>${findings.length}</strong> security issue(s):</p>
      ${findings
        .map(
          (f) => `
        <div style="border-left: 3px solid ${f.severity === "CRITICAL" ? "#dc2626" : "#f59e0b"}; padding: 8px 12px; margin: 12px 0; background: #f9fafb;">
          <strong>[${f.severity}] ${f.title}</strong>
          <p style="margin: 4px 0; font-size: 14px; color: #555;">${f.description}</p>
        </div>
      `,
        )
        .join("")}
      <p style="font-size: 13px; color: #888;">
        View details and fix prompts in your <a href="#">VibeSafe dashboard</a>.
      </p>
    </div>
  `;
}

function buildSlackMessage(appName: string, appUrl: string, findings: SecurityFinding[]): string {
  const lines = findings.map((f) => `• *[${f.severity}]* ${f.title}`);
  return `⚠️ *VibeSafe Alert: ${appName}*\n<${appUrl}>\n\n${findings.length} issue(s) detected:\n${lines.join("\n")}`;
}
