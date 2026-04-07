import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStripe, PLANS } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";

const checkoutSchema = z.object({
  // Keep ENTERPRISE_PLUS accepted for backward compatibility, even if not shown in customer-facing pricing UI.
  // LTD is a one-time payment . handled with mode: "payment" instead of "subscription".
  plan: z.enum(["LTD", "FREE", "STARTER", "PRO", "ENTERPRISE", "ENTERPRISE_PLUS"]),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);

  const rl = await checkRateLimit(`stripe-checkout:${session.id}`, { maxAttempts: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("BAD_REQUEST", "Invalid plan", undefined, 400);
  }

  const plan = PLANS[parsed.data.plan as PlanKey];
  if (!plan.priceId) {
    return errorResponse("INTERNAL_ERROR", "Stripe not configured for this plan", undefined, 500);
  }

  // Get or create Stripe customer
  const org = await db.organization.findUnique({ where: { id: session.orgId } });
  if (!org) return errorResponse("NOT_FOUND", "Org not found", undefined, 404);

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: session.email,
      name: org.name,
      metadata: { orgId: org.id },
    });

    // Atomic claim: only write if stripeCustomerId is still null
    const result = await db.organization.updateMany({
      where: { id: session.orgId, stripeCustomerId: null },
      data: { stripeCustomerId: customer.id },
    });

    if (result.count === 0) {
      // Another request won the race -- clean up orphaned Stripe customer
      await getStripe().customers.del(customer.id).catch(() => {});
      // Re-fetch to get the real customerId
      const fresh = await db.organization.findUnique({
        where: { id: session.orgId },
        select: { stripeCustomerId: true },
      });
      customerId = fresh?.stripeCustomerId ?? customer.id;
    } else {
      customerId = customer.id;
    }
  }

  // LTD uses one-time payment mode; all other plans are subscriptions
  const isOneTime = "isOneTime" in plan && plan.isOneTime === true;
  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: isOneTime ? "payment" : "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/settings/billing?success=true&plan=${parsed.data.plan}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/pricing`,
    metadata: { orgId: session.orgId, plan: parsed.data.plan },
    // For LTD: allow promotion codes so we can run campaigns later
    allow_promotion_codes: isOneTime,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
