import { db } from "@/lib/db";
import type { SecurityFinding } from "@/lib/types";

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL ?? "alerts@vibesafe.local";

  if (!key) {
    console.warn("RESEND_API_KEY not set. Skipping email send.");
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });
}

export async function sendCriticalFindingsAlert(appId: string, findings: SecurityFinding[]) {
  if (!findings.length) return;
  const app = await db.monitoredApp.findUnique({ where: { id: appId } });
  if (!app) return;

  const high = findings.filter((f) => ["HIGH", "CRITICAL"].includes(f.severity));
  if (!high.length) return;

  const html = `
    <h2>VibeSafe Alert: ${app.name}</h2>
    <p>We detected <strong>${high.length}</strong> high-risk issue(s).</p>
    <ul>
      ${high
        .map(
          (f) => `<li><strong>[${f.severity}] ${f.title}</strong><br/>${f.description}<pre>${f.fixPrompt}</pre></li>`,
        )
        .join("")}
    </ul>
    <p>App URL: ${app.url}</p>
  `;

  await sendEmail(app.ownerEmail, `VibeSafe Alert: ${app.name}`, html);
}
