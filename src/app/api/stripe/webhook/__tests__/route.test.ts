import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    subscription: {
      findUnique: mockFindUnique,
      upsert: mockUpsert,
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
  },
}));

const mockConstructEvent = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
  PLANS: {
    LTD: { priceId: "price_ltd", maxApps: 999, maxUsers: 999, name: "Lifetime Deal", price: 79, isOneTime: true },
    FREE: { priceId: "price_free", maxApps: 1, maxUsers: 1, name: "Builder", price: 49, isOneTime: false },
    STARTER: { priceId: "price_starter", maxApps: 5, maxUsers: 2, name: "Starter", price: 199, isOneTime: false },
    PRO: { priceId: "price_pro", maxApps: 15, maxUsers: 10, name: "Pro", price: 399, isOneTime: false },
    ENTERPRISE: { priceId: "price_ent", maxApps: 100, maxUsers: 50, name: "Enterprise", price: 1500, isOneTime: false },
    ENTERPRISE_PLUS: { priceId: "price_ent_plus", maxApps: 999, maxUsers: 999, name: "Enterprise Plus", price: 2500, isOneTime: false },
  },
}));

const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: mockTrackEvent,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    body,
    headers: {
      "content-type": "text/plain",
      ...headers,
    },
  });
}

function makeEvent(type: string, data: object, id = "evt_test_001") {
  return { id, type, data: { object: data } };
}

async function callRoute(req: Request) {
  const { POST } = await import("../route");
  return POST(req);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

// ---------------------------------------------------------------------------
// Missing env / sig validation
// ---------------------------------------------------------------------------

describe("stripe webhook — signature validation", () => {
  it("returns 400 when stripe-signature header is missing", async () => {
    const req = makeRequest("{}");
    const res = await callRoute(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when STRIPE_WEBHOOK_SECRET is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const req = makeRequest("{}", { "stripe-signature": "sig_test" });
    const res = await callRoute(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when constructEvent throws (invalid signature)", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });
    const req = makeRequest("{}", { "stripe-signature": "bad_sig" });
    const res = await callRoute(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// checkout.session.completed
// ---------------------------------------------------------------------------

describe("stripe webhook — checkout.session.completed", () => {
  it("happy path: upserts subscription to ACTIVE with correct tier", async () => {
    const event = makeEvent("checkout.session.completed", {
      metadata: { orgId: "org_1", plan: "STARTER" },
      subscription: "sub_abc",
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ tier: "FREE" });
    mockUpsert.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: "org_1" },
        update: expect.objectContaining({ tier: "STARTER", status: "ACTIVE" }),
        create: expect.objectContaining({ orgId: "org_1", tier: "STARTER", status: "ACTIVE" }),
      }),
    );
  });

  it("LTD planKey maps to LTD tier in DB with no stripeSubscriptionId", async () => {
    // LTD is a one-time payment — Stripe sets subscription to null
    const event = makeEvent("checkout.session.completed", {
      metadata: { orgId: "org_ltd", plan: "LTD" },
      subscription: null,
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ tier: "FREE" });
    mockUpsert.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    await callRoute(req);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ tier: "LTD" }),
        create: expect.objectContaining({ tier: "LTD" }),
      }),
    );
    // stripeSubscriptionId must NOT be present in the upsert payload for LTD
    const call = mockUpsert.mock.calls[0][0];
    expect(call.update).not.toHaveProperty("stripeSubscriptionId");
    expect(call.create).not.toHaveProperty("stripeSubscriptionId");
  });

  it("missing orgId in metadata: no DB write, returns 200", async () => {
    const event = makeEvent("checkout.session.completed", {
      metadata: { plan: "STARTER" },
      subscription: "sub_abc",
    });
    mockConstructEvent.mockReturnValue(event);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("missing planKey in metadata: no DB write, returns 200", async () => {
    const event = makeEvent("checkout.session.completed", {
      metadata: { orgId: "org_1" },
      subscription: "sub_abc",
    });
    mockConstructEvent.mockReturnValue(event);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("FREE to STARTER transition fires builder_to_starter event", async () => {
    const event = makeEvent("checkout.session.completed", {
      metadata: { orgId: "org_1", plan: "STARTER" },
      subscription: "sub_abc",
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ tier: "FREE" });
    mockUpsert.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);
    process.env.INTERNAL_ANALYTICS_ENABLED = "1";

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    await callRoute(req);

    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: "builder_to_starter" }),
    );

    delete process.env.INTERNAL_ANALYTICS_ENABLED;
  });

  it("STARTER to PRO transition fires starter_to_pro event", async () => {
    const event = makeEvent("checkout.session.completed", {
      metadata: { orgId: "org_1", plan: "PRO" },
      subscription: "sub_abc",
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ tier: "STARTER" });
    mockUpsert.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);
    process.env.INTERNAL_ANALYTICS_ENABLED = "1";

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    await callRoute(req);

    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: "starter_to_pro" }),
    );

    delete process.env.INTERNAL_ANALYTICS_ENABLED;
  });

  it("upgrade that does not match a known transition: no analytics event fired", async () => {
    // PRO to ENTERPRISE is not a tracked transition
    const event = makeEvent("checkout.session.completed", {
      metadata: { orgId: "org_1", plan: "ENTERPRISE" },
      subscription: "sub_abc",
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ tier: "PRO" });
    mockUpsert.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// customer.subscription.updated
// ---------------------------------------------------------------------------

describe("stripe webhook — customer.subscription.updated", () => {
  it("known subscription + recognized price ID: updates tier and status", async () => {
    const event = makeEvent("customer.subscription.updated", {
      id: "sub_existing",
      status: "active",
      cancel_at_period_end: false,
      items: { data: [{ price: { id: "price_pro" } }] },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "rec_1", orgId: "org_1", tier: "STARTER" });
    mockUpdate.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tier: "PRO", status: "ACTIVE" }),
      }),
    );
  });

  it("known subscription + unrecognized price ID: updates status only, keeps existing tier", async () => {
    const event = makeEvent("customer.subscription.updated", {
      id: "sub_existing",
      status: "active",
      cancel_at_period_end: false,
      items: { data: [{ price: { id: "price_unknown_xyz" } }] },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "rec_1", orgId: "org_1", tier: "PRO" });
    mockUpdate.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    await callRoute(req);

    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.data.status).toBe("ACTIVE");
    // tier should not be in the update payload when price is unrecognized
    expect(updateCall.data.tier).toBeUndefined();
  });

  it("cancel_at_period_end: true is saved correctly", async () => {
    const event = makeEvent("customer.subscription.updated", {
      id: "sub_existing",
      status: "active",
      cancel_at_period_end: true,
      items: { data: [{ price: { id: "price_starter" } }] },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "rec_1", orgId: "org_1", tier: "STARTER" });
    mockUpdate.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    await callRoute(req);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cancelAtPeriodEnd: true }),
      }),
    );
  });

  it("subscription not found in DB: no-op, returns 200", async () => {
    const event = makeEvent("customer.subscription.updated", {
      id: "sub_notfound",
      status: "active",
      cancel_at_period_end: false,
      items: { data: [{ price: { id: "price_pro" } }] },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue(null);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// invoice.payment_failed
// ---------------------------------------------------------------------------

describe("stripe webhook — invoice.payment_failed", () => {
  it("valid subscription ID found: status set to PAST_DUE", async () => {
    const event = makeEvent("invoice.payment_failed", {
      parent: {
        subscription_details: {
          subscription: "sub_pastdue",
        },
      },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "rec_1", orgId: "org_1" });
    mockUpdate.mockResolvedValue({});

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "PAST_DUE" },
      }),
    );
  });

  it("subscription not found: no-op, returns 200", async () => {
    const event = makeEvent("invoice.payment_failed", {
      parent: {
        subscription_details: {
          subscription: "sub_notfound",
        },
      },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue(null);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("null subscriptionId (missing parent.subscription_details): no-op, returns 200", async () => {
    const event = makeEvent("invoice.payment_failed", {
      // No parent field at all
    });
    mockConstructEvent.mockReturnValue(event);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// customer.subscription.deleted
// ---------------------------------------------------------------------------

describe("stripe webhook — customer.subscription.deleted", () => {
  it("known subscription: resets to FREE, CANCELED, nulls stripe IDs", async () => {
    const event = makeEvent("customer.subscription.deleted", {
      id: "sub_todelete",
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "rec_1", orgId: "org_1", tier: "PRO" });
    mockUpdate.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tier: "FREE",
          status: "CANCELED",
          stripeSubscriptionId: null,
          stripePriceId: null,
        }),
      }),
    );
  });

  it("churned from non-FREE tier: fires subscription_churned event", async () => {
    const event = makeEvent("customer.subscription.deleted", { id: "sub_churn" });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "rec_1", orgId: "org_1", tier: "PRO" });
    mockUpdate.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);
    process.env.INTERNAL_ANALYTICS_ENABLED = "1";

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    await callRoute(req);

    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: "subscription_churned" }),
    );

    delete process.env.INTERNAL_ANALYTICS_ENABLED;
  });

  it("churned from FREE tier: no analytics event fired", async () => {
    const event = makeEvent("customer.subscription.deleted", { id: "sub_free_churn" });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "rec_1", orgId: "org_1", tier: "FREE" });
    mockUpdate.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    await callRoute(req);

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it("subscription not found: no-op, returns 200", async () => {
    const event = makeEvent("customer.subscription.deleted", { id: "sub_nope" });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue(null);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Replay idempotency
// ---------------------------------------------------------------------------

describe("stripe webhook — replay idempotency", () => {
  it("same checkout.session.completed event twice: second call is a no-op (upsert same result)", async () => {
    const event = makeEvent("checkout.session.completed", {
      metadata: { orgId: "org_1", plan: "STARTER" },
      subscription: "sub_abc",
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ tier: "FREE" });
    mockUpsert.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req1 = makeRequest("{}", { "stripe-signature": "sig" });
    const res1 = await callRoute(req1);

    vi.clearAllMocks();
    mockConstructEvent.mockReturnValue(event);
    mockFindUnique.mockResolvedValue({ tier: "STARTER" }); // now at STARTER, same as target
    mockUpsert.mockResolvedValue({});
    mockTrackEvent.mockResolvedValue(undefined);

    const req2 = makeRequest("{}", { "stripe-signature": "sig" });
    const res2 = await callRoute(req2);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    // Both calls upsert with same tier
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ tier: "STARTER" }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// invoice.payment_succeeded
// ---------------------------------------------------------------------------

describe("stripe webhook — invoice.payment_succeeded", () => {
  it("restores PAST_DUE subscription to ACTIVE on payment recovery", async () => {
    const event = makeEvent("invoice.payment_succeeded", {
      parent: { subscription_details: { subscription: "sub_recovery" } },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({
      id: "sub_db_1",
      orgId: "org_1",
      stripeSubscriptionId: "sub_recovery",
      status: "PAST_DUE",
    });
    mockUpdate.mockResolvedValue({});

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sub_db_1" },
        data: { status: "ACTIVE" },
      }),
    );
  });

  it("does not update subscription if already ACTIVE (idempotent)", async () => {
    const event = makeEvent("invoice.payment_succeeded", {
      parent: { subscription_details: { subscription: "sub_already_active" } },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({
      id: "sub_db_2",
      orgId: "org_2",
      stripeSubscriptionId: "sub_already_active",
      status: "ACTIVE",
    });

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    // Should NOT update since already ACTIVE
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 200 with no DB write when subscription not found", async () => {
    const event = makeEvent("invoice.payment_succeeded", {
      parent: { subscription_details: { subscription: "sub_unknown" } },
    });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue(null);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 200 when subscription ID is missing from invoice", async () => {
    const event = makeEvent("invoice.payment_succeeded", {
      parent: null,
    });
    mockConstructEvent.mockReturnValue(event);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// customer.subscription.deleted — LTD protection
// ---------------------------------------------------------------------------

describe("stripe webhook — customer.subscription.deleted (LTD guard)", () => {
  it("does NOT downgrade an LTD org even if a subscription deleted event arrives", async () => {
    // Edge case: org was previously on a subscription before getting LTD;
    // old subscription deletion should not overwrite LTD tier.
    const event = makeEvent("customer.subscription.deleted", { id: "sub_old" });
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({
      id: "sub_db_ltd",
      orgId: "org_ltd",
      stripeSubscriptionId: "sub_old",
      tier: "LTD",
    });

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);

    expect(res.status).toBe(200);
    // LTD guard — should break early, no update
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Unknown event type
// ---------------------------------------------------------------------------

describe("stripe webhook — unknown event type", () => {
  it("payment_intent.succeeded: returns 200 received:true, no DB write", async () => {
    const event = makeEvent("payment_intent.succeeded", { id: "pi_test" });
    mockConstructEvent.mockReturnValue(event);

    const req = makeRequest("{}", { "stripe-signature": "sig" });
    const res = await callRoute(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
