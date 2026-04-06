/**
 * Shared security score calculation utility.
 * Used across dashboard, API endpoints, and public pages.
 */

export type Finding = { severity: string; status?: string };

export function calcSecurityScore(findings: Finding[]): number {
  const deductions: Record<string, number> = {
    CRITICAL: 25,
    HIGH: 10,
    MEDIUM: 5,
    LOW: 1,
  };

  let score = 100;
  for (const f of findings) {
    // Skip resolved/ignored when calculating (they shouldn't hurt the score)
    if (f.status === "RESOLVED" || f.status === "IGNORED") continue;
    score -= deductions[f.severity] ?? 1;
  }
  return Math.max(0, score);
}

export function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "#4c1"; // green
  if (score >= 50) return "#dfb317"; // yellow
  return "#e05d44"; // red
}
