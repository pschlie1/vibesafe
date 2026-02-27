import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion,
});

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
