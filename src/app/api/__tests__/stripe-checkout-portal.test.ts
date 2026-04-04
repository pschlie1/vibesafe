/**
 * stripe-checkout-portal.test.ts
 * Unit tests for POST /api/stripe/checkout and POST /api/stripe/portal
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Auth mock ────────────────────────────────────────────────────────────────
const getSession = vi.fn();
vi.mock("@/lib/auth", () => ({ getSession }));

// ─── Rate limit mock ──────────────────────────────────────────────────────────
const checkRateLimit = vi.fn().mockResolvedValue({ allowed: true });
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit,
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────
const orgFindUnique = vi.fn();
const orgUpdateMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findUnique: orgFindUnique,
      updateMany: orgUpdateMany,
    },
  },
}));

// ─── Stripe mock ──────────────────────────────────────────────────────────────
const mockCheckoutCreate = vi.fn();
const mockPortalCreate = vi.fn();
const mockCustomerCreate = vi.fn();
const mockCustomerDel = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    checkout: { sessions: { create: mockCheckoutCreate } },
    billingPortal: { sessions: { create: mockPortalCreate } },
    customers: { create: mockCustomerCreate, del: mockCustomerDel },
  })),
  PLANS: {
    LTD: { priceId: "price_ltd", maxApps: 999, maxUsers: 999, price: 79, isOneTime: true },
    FREE: { priceId: "price_free", maxApps: 1, maxUsers: 1, price: 49, isOneTime: false },
    STARTER: { priceId: "price_starter", maxApps: 5, maxUsers: 2, price: 199, isOneTime: false },
    PRO: { priceId: "price_pro", maxApps: 15, maxUsers: 10, price: 399, isOneTime: false },
    ENTERPRISE: { priceId: "price_ent", maxApps: 100, maxUsers: 50, price: 1500, isOneTime: false },
    ENTERPRISE_PLUS: { priceId: "price_ent_plus", maxApps: 999, maxUsers: 999, price: 2500, isOneTime: false },
  },
}));

const validSession = { id: "user_1", email: "alice@example.com", orgId: "org_1", name: "Alice", role: "OWNER", orgName: "Acme", orgSlug: "acme" };

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockResolvedValue({ allowed: true });
  getSession.mockResolvedValue(validSession);
  mockCheckoutCreate.mockResolvedValue({ url: "https://checkout.stripe.com/default" });
  mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/portal/default" });
  mockCustomerCreate.mockResolvedValue({ id: "cus_default" });
  mockCustomerDel.mockResolvedValue({});
  orgFindUnique.mockResolvedValue({ id: "org_1", name: "Acme", stripeCustomerId: "cus_existing" });
  orgUpdateMany.mockResolvedValue({ count: 1 });
});

function makeReq(body: unknown) {
  return new Request("http://localhost/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkout
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/checkout", () => {
  it("returns 401 when unauthenticated", async () => {
    getSession.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "PRO" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid plan", async () => {
    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "BOGUS" }));
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    checkRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 });
    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "PRO" }));
    expect(res.status).toBe(429);
  });

  it("returns 404 when org not found", async () => {
    orgFindUnique.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "PRO" }));
    expect(res.status).toBe(404);
  });

  it("returns 500 when priceId is not configured", async () => {
    const { PLANS } = await import("@/lib/stripe");
    // Override PRO priceId to empty
    const origPriceId = PLANS.PRO.priceId;
    (PLANS.PRO as { priceId: string }).priceId = "";

    orgFindUnique.mockResolvedValueOnce({ id: "org_1", name: "Acme", stripeCustomerId: "cus_123" });
    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "PRO" }));
    expect(res.status).toBe(500);

    (PLANS.PRO as { priceId: string }).priceId = origPriceId;
  });

  it("creates subscription checkout session for PRO plan (existing customer)", async () => {
    mockCheckoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/session_pro" });

    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "PRO" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.url).toContain("stripe.com");

    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        metadata: expect.objectContaining({ orgId: "org_1", plan: "PRO" }),
      }),
    );
  });

  it("creates payment checkout session for LTD plan (one-time)", async () => {
    mockCheckoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/session_ltd" });

    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "LTD" }));
    expect(res.status).toBe(200);

    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        allow_promotion_codes: true,
        metadata: expect.objectContaining({ plan: "LTD" }),
      }),
    );
  });

  it("creates new Stripe customer when org has none", async () => {
    orgFindUnique.mockResolvedValueOnce({ id: "org_1", name: "Acme", stripeCustomerId: null });
    mockCustomerCreate.mockResolvedValueOnce({ id: "cus_new" });
    orgUpdateMany.mockResolvedValueOnce({ count: 1 });
    mockCheckoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/session_new" });

    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "PRO" }));
    expect(res.status).toBe(200);
    expect(mockCustomerCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: validSession.email, metadata: { orgId: "org_1" } }),
    );
  });

  it("handles customer creation race condition: cleans up orphan, uses winner", async () => {
    orgFindUnique
      .mockResolvedValueOnce({ id: "org_1", name: "Acme", stripeCustomerId: null })
      .mockResolvedValueOnce({ id: "org_1", stripeCustomerId: "cus_winner" });
    mockCustomerCreate.mockResolvedValueOnce({ id: "cus_loser" });
    orgUpdateMany.mockResolvedValueOnce({ count: 0 });
    mockCustomerDel.mockResolvedValueOnce({});
    mockCheckoutCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/ok" });

    const { POST } = await import("@/app/api/stripe/checkout/route");
    const res = await POST(makeReq({ plan: "PRO" }));
    expect(res.status).toBe(200);
    expect(mockCustomerDel).toHaveBeenCalledWith("cus_loser");
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_winner" }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Billing Portal
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/portal", () => {
  it("returns 401 when unauthenticated", async () => {
    getSession.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/stripe/portal/route");
    const res = await POST(new Request("http://localhost/api/stripe/portal", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when org has no stripeCustomerId", async () => {
    orgFindUnique.mockResolvedValueOnce({ id: "org_1", stripeCustomerId: null });
    const { POST } = await import("@/app/api/stripe/portal/route");
    const res = await POST(new Request("http://localhost/api/stripe/portal", { method: "POST" }));
    expect(res.status).toBe(404);
  });

  it("returns 429 when rate limited", async () => {
    checkRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 });
    const { POST } = await import("@/app/api/stripe/portal/route");
    const res = await POST(new Request("http://localhost/api/stripe/portal", { method: "POST" }));
    expect(res.status).toBe(429);
  });

  it("returns portal URL for org with stripeCustomerId", async () => {
    orgFindUnique.mockResolvedValueOnce({ id: "org_1", stripeCustomerId: "cus_123" });
    mockPortalCreate.mockResolvedValueOnce({ url: "https://billing.stripe.com/portal/abc" });

    const { POST } = await import("@/app/api/stripe/portal/route");
    const res = await POST(new Request("http://localhost/api/stripe/portal", { method: "POST" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.url).toContain("billing.stripe.com");
    expect(mockPortalCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_123" }),
    );
  });
});
