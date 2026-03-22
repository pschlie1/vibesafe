# Stripe Integration Status

**Date:** 2026-03-21  
**Status:** ❌ NOT CONNECTED . Stripe is not configured in production

## Current State

- `STRIPE_SECRET_KEY` is empty in all env files  
- No Stripe price IDs are configured  
- The $79 LTD **cannot be purchased** (checkout API didn't support the LTD plan at all)

## What Was Fixed (in this PR)

1. Added `LTD` plan to `src/lib/stripe.ts` PLANS object  
2. Added `LTD` to the checkout route enum  
3. LTD uses `mode: "payment"` (one-time) instead of `mode: "subscription"`  
4. Added `allow_promotion_codes: true` for LTD (enables coupon campaigns)  
5. Updated `.env.example` with `STRIPE_LTD_PRICE_ID` and `STRIPE_ENTERPRISE_PLUS_PRICE_ID`

## To Go Live: Required Steps

### 1. Create Stripe Products/Prices

In [Stripe Dashboard](https://dashboard.stripe.com/products):

| Plan | Type | Price | env var |
|------|------|-------|---------|
| Lifetime Deal | One-time payment | $79 | `STRIPE_LTD_PRICE_ID` |
| Pro | Recurring monthly | $399/mo | `STRIPE_PRO_PRICE_ID` |
| Enterprise | Recurring monthly | Custom | `STRIPE_ENTERPRISE_PRICE_ID` |

### 2. Set Environment Variables in Vercel

Go to [Vercel project settings → Environment Variables](https://vercel.com/peter-schliesmanns-projects/scantient/settings/environment-variables):

```
STRIPE_SECRET_KEY=sk_live_...          # From Stripe → API Keys
STRIPE_WEBHOOK_SECRET=whsec_...        # From Stripe → Webhooks
STRIPE_LTD_PRICE_ID=price_...          # From the LTD product you create
STRIPE_PRO_PRICE_ID=price_...          # From the Pro product you create
STRIPE_ENTERPRISE_PRICE_ID=price_...   # From the Enterprise product
```

### 3. Configure Stripe Webhook

In [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):
- Add endpoint: `https://scantient.com/api/stripe/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

### 4. Test with Live Mode

**Before going live:**
1. Test with `sk_test_` key first (staging/preview deployment)
2. Make a test LTD purchase through the Stripe test UI
3. Verify the `checkout.session.completed` webhook fires and updates the user's org plan
4. Switch to `sk_live_` key in production

### 5. Verify LTD Purchase Flow

Current flow:
1. User clicks "Claim your $79 deal" on `/pricing`
2. Redirects to `/signup?plan=ltd`
3. After auth, should call `POST /api/stripe/checkout` with `{ plan: "LTD" }`
4. Creates Stripe Checkout session with `mode: "payment"`
5. User completes payment on Stripe-hosted page
6. Webhook fires → update org plan to LTD

**⚠️ Note:** The webhook handler at `/api/stripe/webhook` should handle `checkout.session.completed` for LTD purchases separately from subscription events. Verify this handles `mode: "payment"` sessions correctly.

## Summary for Peter

- Stripe is completely disconnected . no one can buy anything right now
- Fixed the LTD checkout bug (was missing from the API entirely)  
- Need to: create products in Stripe, add 4-5 env vars to Vercel, configure webhook
- This is ~30 minutes of setup in the Stripe Dashboard + Vercel
