import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { isPrivateUrl } from "@/lib/ssrf-guard";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const configs = await db.alertConfig.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ configs });
}

const TIER_CHANNELS: Record<string, string[]> = {
  FREE: [],
  STARTER: ["EMAIL"],
  PRO: ["EMAIL", "SLACK", "WEBHOOK"],
  ENTERPRISE: ["EMAIL", "SLACK", "WEBHOOK"],
  ENTERPRISE_PLUS: ["EMAIL", "SLACK", "WEBHOOK"],
  EXPIRED: [],
};

const createSchema = z.object({
  channel: z.enum(["EMAIL", "SLACK", "WEBHOOK"]),
  destination: z.string().min(3),
  minSeverity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  if (["VIEWER", "MEMBER"].includes(session.role)) {
    return errorResponse("FORBIDDEN", "Viewers have read-only access", undefined, 403);
  }

  const limits = await getOrgLimits(session.orgId);
  const allowedChannels = TIER_CHANNELS[limits.tier] ?? [];

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
  }

  if (!allowedChannels.includes(parsed.data.channel)) {
    const available = allowedChannels.length
      ? `Your ${limits.tier} plan supports: ${allowedChannels.join(", ")}.`
      : `Your ${limits.tier} plan does not include alert channels.`;
    return NextResponse.json(
      { error: `${parsed.data.channel} alerts are not available on your plan. ${available} Upgrade for more options.` },
      { status: 403 },
    );
  }

  // SSRF guard for URL-based channels
  if (["SLACK", "WEBHOOK"].includes(parsed.data.channel)) {
    let isBlocked = false;
    try {
      isBlocked = await isPrivateUrl(parsed.data.destination);
    } catch {
      isBlocked = true;
    }
    if (isBlocked) {
      return NextResponse.json(
        { error: "Destination URL points to a private or internal address. Use a public webhook URL." },
        { status: 400 },
      );
    }
  }

  const config = await db.alertConfig.create({
    data: {
      orgId: session.orgId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ config }, { status: 201 });
}
