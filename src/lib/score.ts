/**
 * Shared security score calculation utility.
 * Single source of truth for score / grade / color across
 * dashboard, API endpoints, MCP, and public pages.
 */

export const SEVERITY_DEDUCTION: Record<string, number> = {
  CRITICAL: 25,
  HIGH: 10,
  MEDIUM: 5,
  LOW: 1,
};

export type Finding = { severity: string; status?: string };

export type SeverityCounts = {
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
};

/**
 * Calculate score from an array of findings.
 * Resolved / ignored findings are excluded automatically.
 */
export function calcSecurityScore(findings: Finding[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.status === "RESOLVED" || f.status === "IGNORED") continue;
    score -= SEVERITY_DEDUCTION[f.severity] ?? 1;
  }
  return Math.max(0, score);
}

/**
 * Calculate score from pre-aggregated severity counts
 * (used by MCP and other places that query counts directly).
 */
export function calcScoreFromCounts(counts: SeverityCounts): number {
  const penalty =
    counts.CRITICAL * SEVERITY_DEDUCTION.CRITICAL +
    counts.HIGH * SEVERITY_DEDUCTION.HIGH +
    counts.MEDIUM * SEVERITY_DEDUCTION.MEDIUM +
    counts.LOW * SEVERITY_DEDUCTION.LOW;
  return Math.max(0, 100 - penalty);
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

export function gradeColor(grade: string): string {
  if (grade === "A" || grade === "B") return "#16a34a";
  if (grade === "C") return "#ca8a04";
  if (grade === "D") return "#ea580c";
  return "#dc2626";
}
