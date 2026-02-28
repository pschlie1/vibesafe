import jsPDF from "jspdf";
import { db } from "@/lib/db";

interface ReportApp {
  name: string;
  url: string;
  status: string;
  score: number;
  findings: { severity: string; status: string; title: string }[];
}

function calcScore(findings: { severity: string }[]): number {
  let s = 100;
  for (const f of findings) {
    if (f.severity === "CRITICAL") s -= 25;
    else if (f.severity === "HIGH") s -= 10;
    else if (f.severity === "MEDIUM") s -= 3;
    else s -= 1;
  }
  return Math.max(0, s);
}

export async function generateComplianceReport(orgId: string): Promise<Buffer> {
  const apps = await db.monitoredApp.findMany({
    where: { orgId },
    include: {
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: { findings: true },
      },
    },
  });

  const org = await db.organization.findUnique({ where: { id: orgId }, select: { name: true } });
  const orgName = org?.name ?? "Organization";
  const now = new Date();

  const reportApps: ReportApp[] = apps.map((app) => {
    const latestRun = app.monitorRuns[0];
    const findings = latestRun?.findings ?? [];
    return {
      name: app.name,
      url: app.url,
      status: app.status,
      score: calcScore(findings),
      findings: findings.map((f) => ({ severity: f.severity, status: f.status, title: f.title })),
    };
  });

  const totalFindings = reportApps.reduce((s, a) => s + a.findings.length, 0);
  const criticalCount = reportApps.reduce((s, a) => s + a.findings.filter((f) => f.severity === "CRITICAL").length, 0);
  const highCount = reportApps.reduce((s, a) => s + a.findings.filter((f) => f.severity === "HIGH").length, 0);
  const resolvedCount = reportApps.reduce((s, a) => s + a.findings.filter((f) => f.status === "RESOLVED").length, 0);
  const avgScore = reportApps.length ? Math.round(reportApps.reduce((s, a) => s + a.score, 0) / reportApps.length) : 0;

  const doc = new jsPDF();
  let y = 20;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkPage = (need: number) => { if (y + need > 275) addPage(); };

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("VibeSafe Compliance Report", 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${orgName} — ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 105, y, { align: "center" });
  y += 15;

  // Executive Summary
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = [
    `Applications monitored: ${reportApps.length}`,
    `Average security score: ${avgScore}/100`,
    `Total open findings: ${totalFindings}`,
    `Critical findings: ${criticalCount}`,
    `High findings: ${highCount}`,
    `Resolved findings: ${resolvedCount}`,
  ];
  for (const line of summaryLines) {
    doc.text(`• ${line}`, 18, y);
    y += 6;
  }
  y += 8;

  // Per-App Breakdown
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Per-Application Security Scores", 14, y);
  y += 8;

  for (const app of reportApps) {
    checkPage(30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${app.name} — Score: ${app.score}/100`, 14, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`URL: ${app.url} | Status: ${app.status}`, 18, y);
    y += 5;

    if (app.findings.length === 0) {
      doc.text("No findings.", 18, y);
      y += 6;
    } else {
      for (const f of app.findings.slice(0, 10)) {
        checkPage(6);
        doc.text(`[${f.severity}] ${f.title} (${f.status})`, 22, y);
        y += 5;
      }
      if (app.findings.length > 10) {
        doc.text(`... and ${app.findings.length - 10} more findings`, 22, y);
        y += 5;
      }
    }
    y += 4;
  }

  // Remediation Status
  checkPage(30);
  y += 4;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Remediation Status", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const allFindings = reportApps.flatMap((a) => a.findings);
  const statusCounts: Record<string, number> = {};
  for (const f of allFindings) {
    statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    doc.text(`• ${status}: ${count}`, 18, y);
    y += 6;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`VibeSafe Compliance Report — Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}
