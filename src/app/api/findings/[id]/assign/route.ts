import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { checkRateLimit } from "@/lib/rate-limit";
import { atLeast } from "@/lib/tier-capabilities";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const assignSchema = z.object({
  userId: z.string().nullable(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (session.role === "VIEWER") {
    return errorResponse("FORBIDDEN", "Viewers have read-only access", undefined, 403);
  }

  const rl = await checkRateLimit(`finding-assign:${session.orgId}`, {
    maxAttempts: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const limits = await getOrgLimits(session.orgId);
  if (!atLeast(limits.tier, "STARTER")) {
    return errorResponse("FORBIDDEN", "Finding assignment requires a Starter plan or higher.", undefined, 403);
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  // Verify finding belongs to user's org
  const finding = await db.finding.findFirst({
    where: { id },
    include: { run: { include: { app: true } } },
  });

  if (!finding || finding.run.app.orgId !== session.orgId) {
    return errorResponse("NOT_FOUND", "Not found", undefined, 404);
  }

  const { userId } = parsed.data;

  if (userId === null) {
    // Unassign all
    await db.findingAssignment.deleteMany({ where: { findingId: id } });
    return NextResponse.json({ assignment: null });
  }

  // Verify user belongs to same org
  const user = await db.user.findFirst({
    where: { id: userId, orgId: session.orgId },
  });
  if (!user) {
    return errorResponse("NOT_FOUND", "User not found in org", undefined, 404);
  }

  const assignment = await db.findingAssignment.upsert({
    where: { findingId_userId: { findingId: id, userId } },
    update: {},
    create: { findingId: id, userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ assignment });
}
