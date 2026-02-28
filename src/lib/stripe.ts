import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
    _stripe = new Stripe(key, {
      apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

export const PLANS = {
  STARTER: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    maxApps: 5,
    maxUsers: 2,
    price: 199,
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    maxApps: 15,
    maxUsers: 5,
    price: 399,
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
    maxApps: 50,
    maxUsers: 999,
    price: 799,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
