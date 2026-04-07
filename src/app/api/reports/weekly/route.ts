import { subDays } from "date-fns";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";
import { calcSecurityScore } from "@/lib/score";

type AppRow = {
  name: string;
  url: string;
  ownerEmail: string | null;
  status: string;
  lastCheckedAt: Date | null;
  monitorRuns: Array<{ findings: Array<{ severity: string; title: string }> }>;
};



function buildReport(apps: AppRow[]) {
  return apps.map((app) => {
    const findings = app.monitorRuns.flatMap((r) => r.findings);
    const critical = findings.filter((f) => f.severity === "CRITICAL").length;
    const high = findings.filter((f) => f.severity === "HIGH").length;
    const score = calcSecurityScore(findings);
    return {
      app: app.name,
      url: app.url,
      owner: app.ownerEmail,
      status: app.status,
      runs: app.monitorRuns.length,
      criticalFindings: critical,
      highFindings: high,
      score,
      lastCheckedAt: app.lastCheckedAt,
    };
  });
}

function buildEmailHtml(
  orgName: string,
  report: ReturnType<typeof buildReport>,
  since: Date,
): string {
  const totalCritical = report.reduce((a, r) => a + r.criticalFindings, 0);
  const totalHigh = report.reduce((a, r) => a + r.highFindings, 0);
  const worstApps = [...report].sort((a, b) => a.score - b.score).slice(0, 3);

  const rows = report
    .map(
      (r) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 12px;font-weight:500;">${r.app}</td>
        <td style="padding:10px 12px;text-align:center;font-weight:700;color:${r.score >= 80 ? "#16a34a" : r.score >= 50 ? "#d97706" : "#dc2626"};">${r.score}</td>
        <td style="padding:10px 12px;text-align:center;color:${r.criticalFindings > 0 ? "#dc2626" : "#6b7280"};">${r.criticalFindings}</td>
        <td style="padding:10px 12px;text-align:center;">${r.runs}</td>
        <td style="padding:10px 12px;color:#6b7280;font-size:12px;">${r.lastCheckedAt ? new Date(r.lastCheckedAt).toLocaleDateString() : "—"}</td>
      </tr>`,
    )
    .join("");

  const worstHtml =
    worstApps.length > 0 && worstApps[0].score < 80
      ? `<div style="margin:24px 0;padding:16px;background:#fef2f2;border-radius:8px;border:1px solid #fee2e2;">
          <p style="margin:0 0 8px;font-weight:600;color:#dc2626;">⚠️ Needs attention</p>
          ${worstApps
            .filter((a) => a.score < 80)
            .map((a) => `<p style="margin:4px 0;font-size:14px;color:#374151;"><strong>${a.app}</strong> — Score ${a.score}/100 (${a.criticalFindings} critical)</p>`)
            .join("")}
        </div>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <!-- Header -->
    <div style="background:#0d1b2a;padding:24px 32px;">
      <p style="margin:0;color:#93c5fd;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Weekly Digest</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${orgName} Security Report</h1>
      <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Week of ${since.toLocaleDateString()} – ${new Date().toLocaleDateString()}</p>
    </div>

    <div style="padding:32px;">
      <!-- Summary -->
      <div style="display:flex;gap:16px;margin-bottom:24px;">
        <div style="flex:1;text-align:center;background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
          <p style="margin:0;font-size:28px;font-weight:700;color:${totalCritical > 0 ? "#dc2626" : "#16a34a"};">${totalCritical}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Critical findings</p>
        </div>
        <div style="flex:1;text-align:center;background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
          <p style="margin:0;font-size:28px;font-weight:700;color:${totalHigh > 0 ? "#d97706" : "#16a34a"};">${totalHigh}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">High findings</p>
        </div>
        <div style="flex:1;text-align:center;background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#374151;">${report.length}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Apps monitored</p>
        </div>
      </div>

      ${worstHtml}

      <!-- App table -->
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 12px;">All apps</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">App</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;">Score</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;">Critical</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;">Scans</th>
            <th style="padding:10px 12px;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;">Last scan</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <!-- CTA -->
      <div style="margin-top:28px;text-align:center;">
        <a href="https://scantient.com/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">View dashboard →</a>
      </div>

      <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center;">
        You're receiving this because weekly digests are enabled for your organization.<br>
        <a href="https://scantient.com/settings/notifications" style="color:#6b7280;">Manage preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function sendDigestEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL ?? "digest@scantient.com";
  if (!key) {
    console.warn("[weekly-digest] RESEND_API_KEY not set. Skipping email send.");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}

// GET /api/reports/weekly — returns JSON report (used by dashboard preview)
// POST /api/reports/weekly — sends the digest email to the org owner
export async function GET() {
  const since = subDays(new Date(), 7);
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const limits = await getOrgLimits(session.orgId);
  if (!["STARTER", "LTD", "PRO", "ENTERPRISE", "ENTERPRISE_PLUS"].includes(limits.tier)) {
    return errorResponse("FORBIDDEN", "Weekly reports require a Starter plan or higher.", undefined, 403);
  }

  const rl = await checkRateLimit(`report:weekly:${session.orgId}`, {
    maxAttempts: 5,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before generating another report." },
      { status: 429, headers: rl.retryAfterSeconds ? { "Retry-After": String(rl.retryAfterSeconds) } : {} },
    );
  }

  const apps = await db.monitoredApp.findMany({
    where: { orgId: session.orgId },
    include: {
      monitorRuns: {
        where: { startedAt: { gte: since } },
        take: 10,
        orderBy: { startedAt: "desc" },
        include: { findings: { select: { severity: true, title: true }, take: 200 } },
      },
    },
  });

  return NextResponse.json({ generatedAt: new Date(), report: buildReport(apps) });
}

export async function POST() {
  const since = subDays(new Date(), 7);
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (session.role === "VIEWER") {
    return errorResponse("FORBIDDEN", "Viewers cannot trigger digest emails.", undefined, 403);
  }

  const limits = await getOrgLimits(session.orgId);
  if (!["STARTER", "LTD", "PRO", "ENTERPRISE", "ENTERPRISE_PLUS"].includes(limits.tier)) {
    return errorResponse("FORBIDDEN", "Weekly digests require a Starter plan or higher.", undefined, 403);
  }

  const rl = await checkRateLimit(`digest:send:${session.orgId}`, {
    maxAttempts: 3,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const org = await db.organization.findUnique({
    where: { id: session.orgId },
    select: { name: true, users: { where: { role: "OWNER" }, select: { email: true }, take: 1 } },
  });
  if (!org) return errorResponse("NOT_FOUND", "Organization not found", undefined, 404);

  const ownerEmail = org.users[0]?.email;
  if (!ownerEmail) return errorResponse("NOT_FOUND", "No owner email found", undefined, 404);

  const apps = await db.monitoredApp.findMany({
    where: { orgId: session.orgId },
    include: {
      monitorRuns: {
        where: { startedAt: { gte: since } },
        take: 10,
        orderBy: { startedAt: "desc" },
        include: { findings: { select: { severity: true, title: true }, take: 200 } },
      },
    },
  });

  const report = buildReport(apps);
  const html = buildEmailHtml(org.name, report, since);

  try {
    await sendDigestEmail(ownerEmail, `[Scantient] Weekly security digest — ${org.name}`, html);
  } catch (err) {
    console.error("[weekly-digest] Failed to send digest email:", err);
    return NextResponse.json(
      { error: "Failed to send digest email. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ sent: true, to: ownerEmail, appsIncluded: apps.length });
}
