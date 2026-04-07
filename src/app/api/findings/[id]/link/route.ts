import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseRemediationMeta, linkPRToFinding } from "@/lib/remediation-lifecycle";
import { getOrgLimits } from "@/lib/tenant";
import { checkRateLimit } from "@/lib/rate-limit";
import { atLeast } from "@/lib/tier-capabilities";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const linkSchema = z.object({
  url: z.string().url().refine(
    (u) => /github\.com\//.test(u),
    { message: "Must be a GitHub PR or commit URL" },
  ),
  title: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (session.role === "VIEWER") {
    return errorResponse("FORBIDDEN", "Viewers have read-only access", undefined, 403);
  }

  const rl = await checkRateLimit(`finding-link:${session.orgId}`, {
    maxAttempts: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const limits = await getOrgLimits(session.orgId);
  if (!atLeast(limits.tier, "PRO")) {
    return errorResponse("FORBIDDEN", "PR linking requires a Pro plan or higher.", undefined, 403);
  }

  const { id } = await params;

  // Verify finding belongs to org
  const finding = await db.finding.findFirst({
    where: { id, run: { app: { orgId: session.orgId } } },
  });
  if (!finding) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  const body = await req.json();
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);

  const meta = await linkPRToFinding(id, {
    url: parsed.data.url,
    title: parsed.data.title,
    linkedAt: new Date().toISOString(),
    linkedBy: session.id,
  });

  await db.auditLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "FINDING_PR_LINKED",
      resource: `finding:${id}`,
      details: JSON.stringify({ url: parsed.data.url }),
    },
  });

  return NextResponse.json({ linkedPRs: meta.linkedPRs });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const limits = await getOrgLimits(session.orgId);
  if (!atLeast(limits.tier, "PRO")) {
    return errorResponse("FORBIDDEN", "PR linking requires a Pro plan or higher.", undefined, 403);
  }

  const { id } = await params;
  const finding = await db.finding.findFirst({
    where: { id, run: { app: { orgId: session.orgId } } },
  });
  if (!finding) return errorResponse("NOT_FOUND", "Not found", undefined, 404);

  const { meta } = parseRemediationMeta(finding.notes);
  return NextResponse.json({ linkedPRs: meta.linkedPRs });
}
