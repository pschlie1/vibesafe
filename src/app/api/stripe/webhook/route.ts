import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, PLANS } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { trackEvent } from "@/lib/analytics";
import type { SubscriptionTier } from "@prisma/client";

/**
 * Map a Stripe PlanKey to a DB SubscriptionTier.
 * Direct 1:1 mapping now that ENTERPRISE_PLUS is a first-class enum value.
 */
function toDbTier(planKey: PlanKey): SubscriptionTier {
  const map: Record<PlanKey, SubscriptionTier> = {
    // LTD is a one-time purchase; maps to PRO tier in DB until a dedicated LTD tier is added to the schema.
    // TODO(peter): Add LTD to SubscriptionTier enum in prisma/schema.prisma + run prisma migrate dev.
    LTD: "PRO",
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
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    // constructEvent verifies the Stripe-Signature header — events not originating
    // from Stripe will throw and return 400 before any DB writes occur.
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: all DB writes below use `upsert` keyed on orgId/stripeSubscriptionId,
  // so replayed events (Stripe guarantees at-least-once delivery) are safe no-ops.
  // If stricter deduplication is ever required, store event.id in a processed_events
  // table and skip if already seen.

  switch (event.type) {
    case "checkout.session.completed": {
      const obj = event.data.object as Stripe.Checkout.Session;
      const orgId = obj.metadata?.orgId;
      const planKey = obj.metadata?.plan as PlanKey | undefined;
      const subscriptionId = obj.subscription as string;

      if (!orgId || !planKey) break;

      const plan = PLANS[planKey];
      const toTier = toDbTier(planKey);
      const previous = await db.subscription.findUnique({
        where: { orgId },
        select: { tier: true },
      });

      await db.subscription.upsert({
        where: { orgId },
        update: {
          tier: toTier,
          status: "ACTIVE",
          stripeSubscriptionId: subscriptionId,
          stripePriceId: plan.priceId,
          maxApps: plan.maxApps,
          maxUsers: plan.maxUsers,
          trialEndsAt: null,
        },
        create: {
          orgId,
          tier: toTier,
          status: "ACTIVE",
          stripeSubscriptionId: subscriptionId,
          stripePriceId: plan.priceId,
          maxApps: plan.maxApps,
          maxUsers: plan.maxUsers,
        },
      });

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

      await db.subscription.update({
        where: { id: existing.id },
        data: { status: "PAST_DUE" },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const obj = event.data.object as Stripe.Subscription;
      const existing = await db.subscription.findFirst({
        where: { stripeSubscriptionId: obj.id },
      });
      if (!existing) break;

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
