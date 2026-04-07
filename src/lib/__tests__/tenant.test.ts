import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — use vi.hoisted so refs are available before hoisting
// ---------------------------------------------------------------------------

const {
  mockSubscriptionFindUnique,
  mockMonitoredAppCount,
  mockUserCount,
  mockAuditLogCreate,
} = vi.hoisted(() => ({
  mockSubscriptionFindUnique: vi.fn(),
  mockMonitoredAppCount: vi.fn(),
  mockUserCount: vi.fn(),
  mockAuditLogCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    subscription: {
      findUnique: mockSubscriptionFindUnique,
    },
    monitoredApp: {
      count: mockMonitoredAppCount,
    },
    user: {
      count: mockUserCount,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
  },
}));

// ---------------------------------------------------------------------------
// Import under test
// ---------------------------------------------------------------------------

import { getOrgLimits, canAddApp, canAddUser, logAudit } from "@/lib/tenant";
import type { SessionUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const oneDay = 24 * 60 * 60 * 1000;

function futureDate(offsetMs: number): Date {
  return new Date(Date.now() + offsetMs);
}

function pastDate(offsetMs: number): Date {
  return new Date(Date.now() - offsetMs);
}

// ---------------------------------------------------------------------------
// getOrgLimits
// ---------------------------------------------------------------------------

describe("getOrgLimits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("FREE tier (no subscription row): returns maxApps 1, maxUsers 1", async () => {
    mockSubscriptionFindUnique.mockResolvedValue(null);

    const result = await getOrgLimits("org_free");

    expect(result.maxApps).toBe(1);
    expect(result.maxUsers).toBe(1);
    expect(result.tier).toBe("FREE");
  });

  it("STARTER subscription (ACTIVE): returns correct limits", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "STARTER",
      status: "ACTIVE",
      maxApps: 5,
      maxUsers: 2,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });

    const result = await getOrgLimits("org_starter");

    expect(result.tier).toBe("STARTER");
    expect(result.maxApps).toBe(5);
    expect(result.maxUsers).toBe(2);
  });

  it("PRO subscription: returns correct limits", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "PRO",
      status: "ACTIVE",
      maxApps: 15,
      maxUsers: 10,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });

    const result = await getOrgLimits("org_pro");

    expect(result.maxApps).toBe(15);
    expect(result.maxUsers).toBe(10);
  });

  it("ENTERPRISE subscription: returns correct limits", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "ENTERPRISE",
      status: "ACTIVE",
      maxApps: 100,
      maxUsers: 50,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });

    const result = await getOrgLimits("org_ent");

    expect(result.maxApps).toBe(100);
    expect(result.maxUsers).toBe(50);
  });

  it("ENTERPRISE_PLUS subscription: returns correct limits", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "ENTERPRISE_PLUS",
      status: "ACTIVE",
      maxApps: 999,
      maxUsers: 999,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });

    const result = await getOrgLimits("org_ent_plus");

    expect(result.maxApps).toBe(999);
    expect(result.maxUsers).toBe(999);
  });

  it("trial not expired (trialEndsAt in future, status TRIALING): returns actual tier, not EXPIRED", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "PRO",
      status: "TRIALING",
      maxApps: 15,
      maxUsers: 10,
      trialEndsAt: futureDate(oneDay),
      cancelAtPeriodEnd: false,
    });

    const result = await getOrgLimits("org_trialing");

    expect(result.tier).toBe("PRO");
    expect(result.maxApps).toBe(15);
  });

  it("trial expired (trialEndsAt in past, status TRIALING): returns EXPIRED tier with maxApps 0", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "PRO",
      status: "TRIALING",
      maxApps: 15,
      maxUsers: 10,
      trialEndsAt: pastDate(oneDay),
      cancelAtPeriodEnd: false,
    });

    const result = await getOrgLimits("org_trial_expired");

    expect(result.tier).toBe("EXPIRED");
    expect(result.maxApps).toBe(0);
    expect(result.maxUsers).toBe(0);
  });

  it("trial expired but status is ACTIVE: does NOT downgrade to EXPIRED (billing took over)", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "STARTER",
      status: "ACTIVE",
      maxApps: 5,
      maxUsers: 2,
      trialEndsAt: pastDate(oneDay),
      cancelAtPeriodEnd: false,
    });

    const result = await getOrgLimits("org_converted");

    expect(result.tier).toBe("STARTER");
    expect(result.maxApps).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// canAddApp
// ---------------------------------------------------------------------------

describe("canAddApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("org at app limit: returns allowed false with reason including tier and limit", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "STARTER",
      status: "ACTIVE",
      maxApps: 5,
      maxUsers: 2,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });
    mockMonitoredAppCount.mockResolvedValue(5);

    const result = await canAddApp("org_1");

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/STARTER/);
    expect(result.reason).toMatch(/5/);
  });

  it("org under app limit: returns allowed true", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "PRO",
      status: "ACTIVE",
      maxApps: 15,
      maxUsers: 10,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });
    mockMonitoredAppCount.mockResolvedValue(3);

    const result = await canAddApp("org_1");

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// canAddUser
// ---------------------------------------------------------------------------

describe("canAddUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("org at user limit: returns allowed false", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "STARTER",
      status: "ACTIVE",
      maxApps: 5,
      maxUsers: 2,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });
    mockUserCount.mockResolvedValue(2);

    const result = await canAddUser("org_1");

    expect(result.allowed).toBe(false);
  });

  it("org under user limit: returns allowed true", async () => {
    mockSubscriptionFindUnique.mockResolvedValue({
      tier: "PRO",
      status: "ACTIVE",
      maxApps: 15,
      maxUsers: 10,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
    });
    mockUserCount.mockResolvedValue(4);

    const result = await canAddUser("org_1");

    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// logAudit
// ---------------------------------------------------------------------------

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an AuditLog row with correct orgId, userId, action, resource, and details", async () => {
    mockAuditLogCreate.mockResolvedValue({});

    const session: SessionUser = {
      id: "user_abc",
      email: "test@example.com",
      name: "Test User",
      role: "ADMIN",
      orgId: "org_xyz",
      orgName: "Test Org",
      orgSlug: "test-org",
    };

    await logAudit(session, "CREATE_APP", "monitored_app", "Created app foo");

    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        orgId: "org_xyz",
        userId: "user_abc",
        action: "CREATE_APP",
        resource: "monitored_app",
        details: "Created app foo",
      },
    });
  });
});
