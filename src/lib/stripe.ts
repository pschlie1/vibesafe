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
  // ─── Lifetime Deal ────────────────────────────────────────────────────────
  // One-time payment of $79. Create as a Stripe one-time price (not subscription).
  // Set STRIPE_LTD_PRICE_ID to the price ID from the Stripe Dashboard.
  LTD: {
    name: "Lifetime Deal",
    priceId: process.env.STRIPE_LTD_PRICE_ID ?? "",
    maxApps: 999,
    maxUsers: 999,
    price: 79,
    isOneTime: true,
  },
  // ─── Subscriptions ────────────────────────────────────────────────────────
  FREE: {
    name: "Builder",
    priceId: process.env.STRIPE_BUILDER_PRICE_ID ?? "",
    maxApps: 1,
    maxUsers: 1,
    price: 49,
    isOneTime: false,
  },
  STARTER: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    maxApps: 5,
    maxUsers: 2,
    price: 199,
    isOneTime: false,
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    maxApps: 15,
    maxUsers: 10,
    price: 399,
    isOneTime: false,
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
    maxApps: 100,
    maxUsers: 50,
    price: 1500,
    isOneTime: false,
  },
  ENTERPRISE_PLUS: {
    name: "Enterprise Plus",
    priceId: process.env.STRIPE_ENTERPRISE_PLUS_PRICE_ID ?? "",
    maxApps: 999,
    maxUsers: 999,
    price: 2500,
    isOneTime: false,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
