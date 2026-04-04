# Scantient Auth + Stripe Audit Report
**Date:** 2026-04-04  
**Auditor:** Dooder (manual code review)  
**Scope:** `/src/lib/auth.ts`, `/src/middleware.ts`, `/src/app/api/auth/`, `/src/app/api/stripe/`, `/src/lib/stripe.ts`, `/src/lib/tier-capabilities.ts`, Prisma schema, existing tests

---

## Executive Summary

1. **Auth is solid overall** — JWT session management, password reset, email verification, SSO (OIDC/PKCE), and invite flows are all implemented and reasonably well-tested.
2. **Stripe code is correct** but **completely disconnected** — no env vars set in production, so no one can purchase anything. This is the #1 blocker before launch.
3. **Missing: resend-verification endpoint** — users who don't receive or lose their verification email have no way to request another one.
4. **URL env var inconsistency** — `signup/route.ts` uses `NEXT_PUBLIC_APP_URL ?? NEXT_PUBLIC_URL` but the `.env.example` only defines `NEXT_PUBLIC_URL`. Other auth routes use only `NEXT_PUBLIC_APP_URL`. Need to standardize.
5. **Missing Stripe webhook events** — `invoice.payment_succeeded` (to confirm payment after failure recovery) and `customer.subscription.trial_will_end` are not handled, leaving edge cases unaddressed.
6. **LTD downgrade protection** — nothing prevents a `customer.subscription.deleted` webhook from downgrading an LTD user to FREE (LTD has no subscription ID, so this is unlikely but worth hardening explicitly).
7. **TypeScript types clean** — `tsc --noEmit` passes (confirmed via CI on latest commits).

---

## Auth System

### ✅ Working

| Flow | Status | Notes |
|------|--------|-------|
| Signup | ✅ | Zod validation, rate-limited (3/hr/IP), org+user+subscription created in one transaction, onboarding email sent |
| Email verification | ✅ | JWT token (24h), `emailVerified` flag enforced on login |
| Login | ✅ | IP + per-email rate limiting (5/15min IP, 10/hr email), email-verified gate, audit log |
| Logout | ✅ | `destroySession()` clears cookie with `maxAge: 0` |
| Forgot password | ✅ | No user enumeration (always 200), per-IP + per-email rate limits, 1h JWT token |
| Reset password | ✅ | Token validated for purpose, one-time use via `updatedAt > iat` check, triggers session invalidation |
| Session refresh | ✅ | Re-validated against DB every 5 min (`REFRESH_THRESHOLD`), invalidated if user updated after token issue |
| Session invalidation on password change | ✅ | `updatedAt` bump in reset-password triggers null return in `getSession()` |
| Team invite | ✅ | Atomic tx (create user + delete invite), user limit check at acceptance time, invite marked single-use |
| SSO (OIDC/PKCE) | ✅ | PKCE + state validation, email domain enforcement, user limit check on new SSO users |
| Route protection (middleware) | ✅ | JWT verified with `jose` (Edge Runtime), protected prefixes enumerated, cookie cleared on invalid token |
| CSP + security headers | ✅ | Nonce-based CSP, HSTS, X-Frame-Options, X-Content-Type-Options |

### ⚠️ Gaps / Issues

**1. No resend-email-verification endpoint**  
`GET /api/auth/verify-email` handles token consumption, but there's no `POST /api/auth/resend-verification` route. If a user doesn't receive the verification email (spam, bounce, old token), they're stuck — can't log in, can't request a new link. This is a real user drop-off risk.

**2. URL env var inconsistency**  
`src/app/api/auth/signup/route.ts` uses:
```ts
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_URL ?? "https://scantient.com";
```
All other auth routes use only `NEXT_PUBLIC_APP_URL`. The `.env.example` only defines `NEXT_PUBLIC_URL`. This means verification links built in `signup/route.ts` will use `NEXT_PUBLIC_URL` correctly in the current Vercel env, but other routes (forgot-password, verify-email) will fall back to the hardcoded `"https://scantient.com"` if `NEXT_PUBLIC_APP_URL` isn't set. Standardize to one var — `NEXT_PUBLIC_URL` — and update all references.

**3. Invite flow: existing user can't accept invite**  
If a user with the same email already exists in the system (different org), they get a 409 and cannot join the invited org. There's no "link existing account to org" path. This is a UX gap for users switching companies or joining a second org.

**4. SSO: no account linking for existing password users**  
If a user signed up with email/password and then their org enables SSO with their email domain, the SSO callback creates a *new* user record (if `findFirst` by `email + orgId` returns null because the existing user has no `orgId` match, or returns the existing user if it does). Edge case: if user signed up under a different org first, SSO creates a duplicate. No deduplication by email across orgs.

**5. Middleware: `/api/auth/reset-password` not in PUBLIC_PATHS**  
`PUBLIC_PATHS` includes `/api/auth/forgot-password` and `/api/auth/verify-email`, but the middleware also has `pathname.startsWith("/api/auth/")` as a blanket pass-through, so this isn't a functional bug — all `/api/auth/*` routes are public. However, the explicit list is misleading and could cause confusion during future refactors.

### ❌ Missing / Broken

| Gap | Severity | Impact |
|-----|----------|--------|
| No resend-verification endpoint | 🔴 High | Users stuck if verification email missed |
| No email-change flow | 🟡 Medium | Users can't update email addresses |
| No account deletion / data export | 🟡 Medium | GDPR/compliance concern |
| SSO: no JIT provisioning config | 🟡 Low | Auto-creates users; no way to disable |

### 🧪 Test Coverage — Auth

| Flow | Has Test? | Quality |
|------|-----------|---------|
| Forgot password | ✅ `auth-flows.test.ts` | Good — covers no-user (200), existing user (200), rate limit |
| Reset password | ✅ `auth-flows.test.ts` | Good — covers token validation, one-time use, expiry |
| Email verification | ✅ `auth-flows.test.ts` | Good — covers happy path, already-verified, bad token |
| Invite (GET + POST) | ✅ `auth-flows.test.ts`, `team-invite.test.ts` | Good — covers expired, accepted, user limit |
| Login | ✅ `auth-config.test.ts`, `rate-limit-auth.test.ts` | Good |
| Session refresh/invalidation | ✅ `auth-session.test.ts` | Good — covers updatedAt invalidation |
| SSO init | ⚠️ Partial | Happy path tested, but no test for domain mismatch rejection |
| SSO callback domain enforcement | ❌ No test | Critical security feature — no test for cross-domain SSO abuse |
| Middleware JWT verification | ⚠️ Partial | Covered in `endpoint-security.test.ts` but not exhaustively |
| Resend verification | ❌ N/A | Endpoint doesn't exist |

---

## Stripe System

### ✅ Working (Code)

| Flow | Status | Notes |
|------|--------|-------|
| LTD checkout (`mode: "payment"`) | ✅ Code | `isOneTime` flag correctly switches to `mode: "payment"` |
| Pro/Starter/Enterprise checkout (`mode: "subscription"`) | ✅ Code | Correct subscription mode |
| Stripe customer create (race condition safe) | ✅ | `updateMany` with `stripeCustomerId: null` guard + orphan cleanup |
| Webhook signature verification | ✅ | `constructEvent` used correctly, raw body preserved |
| `checkout.session.completed` — LTD (one-time) | ✅ | `subscription: null` guard, no `stripeSubscriptionId` written for LTD |
| `checkout.session.completed` — subscription | ✅ | Subscription ID written, tier updated |
| `customer.subscription.updated` — plan change | ✅ | Reverse price-to-plan map, tier/limits updated |
| `customer.subscription.deleted` — churn | ✅ | Downgraded to FREE, sub ID cleared |
| `invoice.payment_failed` — past due | ✅ | Status set to PAST_DUE |
| Billing portal | ✅ | Rate-limited, requires stripeCustomerId |
| Tier gates (`hasFeature`, `atLeast`) | ✅ | LTD correctly ranked equal to PRO |
| Promotion codes for LTD | ✅ | `allow_promotion_codes: true` on one-time checkout |

### ⚠️ Gaps / Issues

**1. `invoice.payment_succeeded` not handled**  
When a `PAST_DUE` user pays their overdue invoice, Stripe fires `invoice.payment_succeeded`. Without handling this, the subscription status stays `PAST_DUE` in the DB permanently — the user's access remains degraded even after they pay. **This is a billing correctness bug.**

**2. Webhook idempotency is partial**  
The code has a comment noting that upserts are idempotent, but `customer.subscription.updated` uses `update` (not `upsert`) and `invoice.payment_failed` uses `update`. If these events replay before the `findFirst` writes complete, they'll silently no-op (record not found → `break`). This is safe but means **duplicate events for payment_failed won't be processed if the first attempt failed mid-write**. Consider storing `event.id` in a `ProcessedWebhookEvent` table for true idempotency.

**3. No handling of `customer.subscription.trial_will_end`**  
The `Subscription` schema has a `TRIALING` status and `trialEndsAt` field. If trials are used, this event should notify users before trial expiry. Currently unhandled.

**4. LTD users can be downgraded by subscription webhooks (theoretical)**  
If a Stripe webhook arrives with `customer.subscription.deleted` for an org that has no `stripeSubscriptionId` (LTD users), the `findFirst` returns null and the handler breaks safely. ✅ This is fine. But if an LTD user *also* had a past subscription (e.g. they subscribed then got an LTD), the old subscription deletion could downgrade them to FREE. Guard: check if current tier is LTD before downgrading.

**5. `NEXT_PUBLIC_URL` vs `NEXT_PUBLIC_APP_URL` in checkout success/cancel URLs**  
`checkout/route.ts` uses `process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"` — consistent with `.env.example`. Good. But the URL var usage is still fragmented across the codebase (see Auth section above).

**6. No webhook event for `checkout.session.expired`**  
If a user starts checkout but abandons it, there's no cleanup of the pending state. Low impact since no state is written on checkout *start*, but worth noting.

**7. Stripe not configured in production — LAUNCH BLOCKER**  
`STRIPE_SECRET_KEY` is empty. No one can purchase anything. Full setup checklist is in `STRIPE-STATUS.md`.

### ❌ Missing / Broken (Blockers)

| Issue | Severity | Fix |
|-------|----------|-----|
| `STRIPE_SECRET_KEY` not configured in Vercel | 🔴 Critical | Set env vars per `STRIPE-STATUS.md` |
| `invoice.payment_succeeded` not handled | 🔴 High | Users stay PAST_DUE forever after paying |
| No `STRIPE_LTD_PRICE_ID` / `STRIPE_PRO_PRICE_ID` etc. | 🔴 Critical | Checkout returns 500 for all plans |

### 🧪 Test Coverage — Stripe

| Flow | Has Test? | Quality |
|------|-----------|---------|
| Webhook signature validation | ✅ `route.test.ts` | Good |
| `checkout.session.completed` — subscription | ✅ | Good |
| `checkout.session.completed` — LTD (one-time) | ✅ | Explicitly tested, null subscription handled |
| `customer.subscription.updated` | ✅ | Covered |
| `customer.subscription.deleted` | ✅ | Covered |
| `invoice.payment_failed` | ✅ | Covered |
| `invoice.payment_succeeded` | ❌ | Not tested (handler missing) |
| Checkout route (POST) | ⚠️ Partial | No dedicated unit test for checkout route |
| Billing portal route | ⚠️ Partial | No dedicated unit test |
| Tier capability gates (all tiers) | ✅ `subscription-tier-flows.test.ts`, `tier-gate-audit-*.test.ts` | Comprehensive |

---

## Security Issues (Ranked by Severity)

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | SSO callback domain enforcement has no test | 🔴 High | `sso/callback/route.ts` — no test for cross-domain email bypass |
| 2 | `invoice.payment_succeeded` unhandled — billing correctness | 🔴 High | `webhook/route.ts` |
| 3 | No resend-verification — user account lockout risk | 🟠 Medium | Missing route |
| 4 | URL env var fragmentation — wrong links possible in staging | 🟡 Medium | Multiple auth routes |
| 5 | Webhook idempotency relies on upsert (partial) | 🟡 Low | `webhook/route.ts` |
| 6 | LTD downgrade edge case if org had prior subscription | 🟡 Low | `webhook/route.ts` — `customer.subscription.deleted` |
| 7 | Middleware `PUBLIC_PATHS` list is misleading (blanket `/api/auth/` catch) | 🟢 Info | `middleware.ts` |

---

## Recommended Fixes (Priority Order)

### 🔴 P0 — Launch Blockers

**1. Configure Stripe in production**  
Follow `STRIPE-STATUS.md`. Create products in Stripe Dashboard, set 5 env vars in Vercel, configure webhook endpoint. ~30 min.

**2. Handle `invoice.payment_succeeded`**  
File: `src/app/api/stripe/webhook/route.ts`  
Add a `case "invoice.payment_succeeded":` block that sets subscription status back to `ACTIVE` when payment recovers from `PAST_DUE`.

```ts
case "invoice.payment_succeeded": {
  const obj = event.data.object as Stripe.Invoice;
  const rawSub = obj.parent?.subscription_details?.subscription;
  const subscriptionId = typeof rawSub === "string" ? rawSub : (rawSub as Stripe.Subscription | null)?.id ?? null;
  if (!subscriptionId) break;
  const existing = await db.subscription.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
  if (!existing) break;
  await db.subscription.update({ where: { id: existing.id }, data: { status: "ACTIVE" } });
  break;
}
```

Also add this event to the Stripe Dashboard webhook listener configuration.

### 🔴 P1 — High Priority

**3. Add resend-verification endpoint**  
Create `src/app/api/auth/resend-verification/route.ts`:
- Accept `{ email }` 
- Rate limit (3/hr/IP, 3/hr/email)
- Return 200 always (no enumeration)
- If user exists + not verified: generate new JWT, send email
- Add to `PUBLIC_PATHS` in middleware

**4. Add SSO domain mismatch test**  
File: add to `src/lib/__tests__/` or `src/app/api/__tests__/`  
Test that a user with `attacker@evil.com` cannot authenticate to an org configured for `company.com`, even if the OIDC provider issues a token for them.

### 🟡 P2 — Medium Priority

**5. Standardize URL env var**  
Pick `NEXT_PUBLIC_URL` (already in `.env.example`) and update all auth routes to use it:
- `src/app/api/auth/signup/route.ts` — remove `NEXT_PUBLIC_APP_URL` reference
- `src/app/api/auth/forgot-password/route.ts` — change to `NEXT_PUBLIC_URL`
- `src/app/api/auth/verify-email/route.ts` — change to `NEXT_PUBLIC_URL`
- `src/app/api/stripe/checkout/route.ts` — already uses `NEXT_PUBLIC_URL` ✅

**6. Guard LTD downgrade in `customer.subscription.deleted`**  
Add check before downgrading:
```ts
if (existing.tier === "LTD") break; // LTD is permanent, not subscription-based
```

### 🟢 P3 — Nice to Have

**7. Add checkout + portal route unit tests**  
Add tests for `POST /api/stripe/checkout` covering: unauthenticated (401), invalid plan (400), missing priceId (500), race condition on customer create.  
Add test for `POST /api/stripe/portal` covering: no stripeCustomerId (404), authenticated happy path.

**8. Add `invoice.payment_succeeded` to webhook tests**  
Mirror the existing `invoice.payment_failed` test pattern.

**9. Consider `ProcessedWebhookEvent` table for idempotency**  
Low urgency, but protects against rare double-delivery edge cases in high-volume scenarios.

---

## Summary Stats

- **Auth flows implemented:** 9/9 ✅
- **Auth flows with tests:** 7/9 (SSO domain enforcement + resend missing)
- **Stripe flows implemented in code:** 6/7 (missing `invoice.payment_succeeded`)
- **Stripe flows live/configured:** 0/7 ❌ (env vars not set)
- **Critical blockers before launch:** 2 (Stripe env vars, `invoice.payment_succeeded`)
- **TypeScript errors:** 0 ✅

---

*Generated by Dooder — manual code review, 2026-04-04*
