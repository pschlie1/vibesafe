import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

/** GET /api/org/digest — returns current weekly digest preference */
export async function GET() {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const org = await db.organization.findUnique({
    where: { id: session.orgId },
    select: { weeklyDigestEnabled: true },
  });

  return NextResponse.json({ weeklyDigestEnabled: org?.weeklyDigestEnabled ?? false });
}

const patchSchema = z.object({
  weeklyDigestEnabled: z.boolean(),
});

/** PATCH /api/org/digest — enable or disable weekly digest emails */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (session.role === "VIEWER") {
    return errorResponse("FORBIDDEN", "Viewers cannot change org settings.", undefined, 403);
  }

  const limits = await getOrgLimits(session.orgId);
  if (!["STARTER", "PRO", "ENTERPRISE", "ENTERPRISE_PLUS"].includes(limits.tier)) {
    return errorResponse(
      "FORBIDDEN",
      "Weekly digests require a Starter plan or higher.",
      undefined,
      403,
    );
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Validation failed",
      zodFieldErrors(parsed.error.flatten().fieldErrors),
      400,
    );
  }

  await db.organization.update({
    where: { id: session.orgId },
    data: { weeklyDigestEnabled: parsed.data.weeklyDigestEnabled },
  });

  return NextResponse.json({ weeklyDigestEnabled: parsed.data.weeklyDigestEnabled });
}
