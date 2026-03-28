import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, PLANS } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { trackEvent } from "@/lib/analytics";
import type { SubscriptionTier } from "@prisma/client";
import { errorResponse } from "@/lib/api-response";
import { logApiError } from "@/lib/observability";

/**
 * Map a Stripe PlanKey to a DB SubscriptionTier.
 * Direct 1:1 mapping — LTD and ENTERPRISE_PLUS are first-class enum values.
 */
function toDbTier(planKey: PlanKey): SubscriptionTier {
  const map: Record<PlanKey, SubscriptionTier> = {
    LTD: "LTD",
    FREE: "FREE",
    STARTER: "STARTER",
    PRO: "PRO",
    ENTERPRISE: "ENTERPRISE",
    ENTERPRISE_PLUS: "ENTERPRISE_PLUS",
  };
  return map[planKey] ?? "FREE";
}

async function trackTierTransitionEvent(input: {
  orgId: string;
  fromTier: SubscriptionTier | null;
  toTier: SubscriptionTier;
  source: string;
}) {
  const { orgId, fromTier, toTier, source } = input;

  if (fromTier === "FREE" && toTier === "STARTER") {
    await trackEvent({
      event: "builder_to_starter",
      orgId,
      properties: { source, fromTier, toTier },
    });
    return;
  }

  if (fromTier === "STARTER" && toTier === "PRO") {
    await trackEvent({
      event: "starter_to_pro",
      orgId,
      properties: { source, fromTier, toTier },
    });
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return errorResponse("BAD_REQUEST", "Missing signature", undefined, 400);
  }

  let event;
  try {
    // constructEvent verifies the Stripe-Signature header . events not originating
    // from Stripe will throw and return 400 before any DB writes occur.
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid signature", undefined, 400);
  }

  console.log("stripe webhook:", event.type, event.id);

  // Idempotency: all DB writes below use `upsert` keyed on orgId/stripeSubscriptionId,
  // so replayed events (Stripe guarantees at-least-once delivery) are safe no-ops.
  // If stricter deduplication is ever required, store event.id in a processed_events
  // table and skip if already seen.

  switch (event.type) {
    case "checkout.session.completed": {
      const obj = event.data.object as Stripe.Checkout.Session;
      const orgId = obj.metadata?.orgId;
      const planKey = obj.metadata?.plan as PlanKey | undefined;
      // For one-time purchases (LTD), obj.subscription is null — guard against that.
      const subscriptionId = typeof obj.subscription === "string" ? obj.subscription : null;

      if (!orgId || !planKey) break;

      const plan = PLANS[planKey];
      const toTier = toDbTier(planKey);
      const previous = await db.subscription.findUnique({
        where: { orgId },
        select: { tier: true },
      });

      try {
        await db.subscription.upsert({
          where: { orgId },
          update: {
            tier: toTier,
            status: "ACTIVE",
            // Only overwrite stripeSubscriptionId when we have one (LTD has none)
            ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
            stripePriceId: plan.priceId,
            maxApps: plan.maxApps,
            maxUsers: plan.maxUsers,
            trialEndsAt: null,
          },
          create: {
            orgId,
            tier: toTier,
            status: "ACTIVE",
            ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
            stripePriceId: plan.priceId,
            maxApps: plan.maxApps,
            maxUsers: plan.maxUsers,
          },
        });
      } catch (err) {
        logApiError(err, { route: "/api/stripe/webhook", method: "POST", orgId, details: { event: event.type, eventId: event.id } });
        break;
      }

      await trackTierTransitionEvent({
        orgId,
        fromTier: previous?.tier ?? "FREE",
        toTier,
        source: "checkout.session.completed",
      });
      break;
    }

    case "customer.subscription.updated": {
      const obj = event.data.object as Stripe.Subscription;
      const existing = await db.subscription.findFirst({
        where: { stripeSubscriptionId: obj.id },
      });
      if (!existing) break;

      // Build reverse price-to-plan map
      const priceToPlan: Record<string, PlanKey> = {};
      for (const [key, plan] of Object.entries(PLANS)) {
        if (plan.priceId) priceToPlan[plan.priceId] = key as PlanKey;
      }

      const newPriceId = obj.items?.data?.[0]?.price?.id as string | undefined;
      const newPlanKey = newPriceId ? priceToPlan[newPriceId] : undefined;
      const newPlan = newPlanKey ? PLANS[newPlanKey] : undefined;
      const nextTier = newPlanKey ? toDbTier(newPlanKey) : existing.tier;

      try {
        await db.subscription.update({
          where: { id: existing.id },
          data: {
            status: obj.status === "active" ? "ACTIVE" : obj.status === "past_due" ? "PAST_DUE" : "CANCELED",
            cancelAtPeriodEnd: obj.cancel_at_period_end ?? false,
            // Only update tier/limits if we can identify the new plan
            ...(newPlan && newPlanKey ? {
              tier: nextTier,
              maxApps: newPlan.maxApps,
              maxUsers: newPlan.maxUsers,
              stripePriceId: newPriceId,
            } : {}),
          },
        });
      } catch (err) {
        logApiError(err, { route: "/api/stripe/webhook", method: "POST", orgId: existing.orgId, details: { event: event.type, eventId: event.id } });
        break;
      }

      await trackTierTransitionEvent({
        orgId: existing.orgId,
        fromTier: existing.tier,
        toTier: nextTier,
        source: "customer.subscription.updated",
      });
      break;
    }

    case "invoice.payment_failed": {
      const obj = event.data.object as Stripe.Invoice;
      // Stripe SDK v20+: subscription ID lives under parent.subscription_details.subscription
      const rawSub = obj.parent?.subscription_details?.subscription;
      const subscriptionId: string | null = typeof rawSub === "string" ? rawSub : (rawSub as Stripe.Subscription | null)?.id ?? null;
      if (!subscriptionId) break;

      const existing = await db.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });
      if (!existing) break;

      try {
        await db.subscription.update({
          where: { id: existing.id },
          data: { status: "PAST_DUE" },
        });
      } catch (err) {
        logApiError(err, { route: "/api/stripe/webhook", method: "POST", orgId: existing.orgId, details: { event: event.type, eventId: event.id } });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const obj = event.data.object as Stripe.Subscription;
      const existing = await db.subscription.findFirst({
        where: { stripeSubscriptionId: obj.id },
      });
      if (!existing) break;

      try {
        await db.subscription.update({
          where: { id: existing.id },
          data: {
            tier: "FREE",
            status: "CANCELED",
            maxApps: 1,
            maxUsers: 1,
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        });
      } catch (err) {
        logApiError(err, { route: "/api/stripe/webhook", method: "POST", orgId: existing.orgId, details: { event: event.type, eventId: event.id } });
        break;
      }

      if (existing.tier !== "FREE") {
        await trackEvent({
          event: "subscription_churned",
          orgId: existing.orgId,
          properties: {
            source: "customer.subscription.deleted",
            fromTier: existing.tier,
            toTier: "FREE",
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
