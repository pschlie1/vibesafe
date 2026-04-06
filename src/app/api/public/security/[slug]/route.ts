/**
 * GET /api/public/security/[slug]
 *
 * Public transparency endpoint. Returns sanitised security posture data for an
 * organisation without exposing finding descriptions or fix guidance that could
 * assist attackers.
 *
 * Exposed: org name, per-app score/grade, finding title + severity + status
 * Hidden:  description, fixPrompt, ownerEmail, internal IDs
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applyCors, corsPreflightResponse, CORS_HEADERS_PUBLIC } from "@/lib/cors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";
import { calcScore, scoreToGrade } from "@/app/api/public/badge/route";

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as const;

async function handler(
  req: Request,
  params: Promise<{ slug: string }>,
): Promise<NextResponse> {
  // Rate-limit: 30 req/min per IP to allow badge embed pages to load
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`public-security:${ip}`, {
    maxAttempts: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: rl.retryAfterSeconds ? { "Retry-After": String(rl.retryAfterSeconds) } : {} },
    );
  }

  const { slug } = await params;

  const org = await db.organization.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!org) {
    return errorResponse("NOT_FOUND", "Organization not found", undefined, 404);
  }

  const apps = await db.monitoredApp.findMany({
    where: { orgId: org.id },
    select: {
      id: true,
      name: true,
      url: true,
      lastCheckedAt: true,
      status: true,
      monitorRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          id: true,
          startedAt: true,
          completedAt: true,
          findings: {
            select: {
              // Safe fields only — no description or fixPrompt
              title: true,
              severity: true,
              status: true,
            },
            where: {
              // Only surface open findings; resolved/ignored issues shouldn't
              // appear on a live transparency page
              status: { in: ["OPEN", "ACKNOWLEDGED"] },
            },
            orderBy: [{ severity: "asc" }, { title: "asc" }],
          },
        },
      },
    },
  });

  const result = apps.map((app) => {
    const latestRun = app.monitorRuns[0] ?? null;
    const findings = latestRun?.findings ?? [];
    const score = calcScore(findings);
    const grade = scoreToGrade(score);

    // Severity counts
    const counts = Object.fromEntries(SEVERITY_ORDER.map((s) => [s, 0])) as Record<string, number>;
    for (const f of findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1;

    return {
      name: app.name,
      // Expose the hostname only, not the full URL (may contain internal paths)
      host: (() => {
        try {
          return new URL(app.url.startsWith("http") ? app.url : `https://${app.url}`).hostname;
        } catch {
          return app.url;
        }
      })(),
      score,
      grade,
      status: app.status,
      lastCheckedAt: app.lastCheckedAt,
      scanCompletedAt: latestRun?.completedAt ?? null,
      findingCounts: counts,
      openFindings: findings.map((f) => ({
        title: f.title,
        severity: f.severity,
      })),
    };
  });

  // Org-wide aggregate score
  const scores = result.map((a) => a.score);
  const orgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return NextResponse.json(
    {
      org: org.name,
      slug,
      orgScore,
      orgGrade: orgScore !== null ? scoreToGrade(orgScore) : null,
      appsMonitored: apps.length,
      generatedAt: new Date(),
      apps: result,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=180, stale-while-revalidate=600",
      },
    },
  );
}

export function OPTIONS() {
  return corsPreflightResponse(CORS_HEADERS_PUBLIC);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return applyCors(await handler(req, params), CORS_HEADERS_PUBLIC);
}
