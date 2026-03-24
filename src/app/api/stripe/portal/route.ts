import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";

export async function POST() {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const rl = await checkRateLimit(`stripe-portal:${session.id}`, { maxAttempts: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const org = await db.organization.findUnique({ where: { id: session.orgId } });
  if (!org?.stripeCustomerId) {
    return errorResponse("NOT_FOUND", "No billing account found", undefined, 404);
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
