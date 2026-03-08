import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionTier } from "@prisma/client";

const auditLogCreateMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: { createMany: auditLogCreateMany },
  },
}));

describe("validateCronAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns unauthorized when CRON_SECRET is not set", async () => {
    delete process.env.CRON_SECRET;
    const { validateCronAuth } = await import("@/lib/cron-auth");
    const req = new Request("https://example.com", { headers: {} });
    const result = validateCronAuth(req);
    expect(result.authorized).toBe(false);
    expect(result.errorResponse).toBeDefined();
  });

  it("returns unauthorized for overlong bearer token without crashing", async () => {
    process.env.CRON_SECRET = "test-secret-123";
    const { validateCronAuth } = await import("@/lib/cron-auth");
    const longToken = "Bearer " + "x".repeat(2000);
    const req = new Request("https://example.com", {
      headers: { authorization: longToken },
    });
    const result = validateCronAuth(req);
    expect(result.authorized).toBe(false);
    expect(result.errorResponse).toBeDefined();
  });

  it("returns unauthorized for incorrect bearer token", async () => {
    process.env.CRON_SECRET = "test-secret-123";
    const { validateCronAuth } = await import("@/lib/cron-auth");
    const req = new Request("https://example.com", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    const result = validateCronAuth(req);
    expect(result.authorized).toBe(false);
  });

  it("returns authorized for correct bearer token", async () => {
    process.env.CRON_SECRET = "test-secret-123";
    const { validateCronAuth } = await import("@/lib/cron-auth");
    const req = new Request("https://example.com", {
      headers: { authorization: "Bearer test-secret-123" },
    });
    const result = validateCronAuth(req);
    expect(result.authorized).toBe(true);
    expect(result.errorResponse).toBeUndefined();
  });
});

describe("tier partition exhaustiveness", () => {
  it("covers every SubscriptionTier exactly once across PREMIUM and NON_PREMIUM", async () => {
    const { PREMIUM_TIERS, NON_PREMIUM_TIERS } = await import("@/lib/cron-auth");
    const allEnum = Object.values(SubscriptionTier) as SubscriptionTier[];
    const combined = [...PREMIUM_TIERS, ...NON_PREMIUM_TIERS];

    expect(combined.sort()).toEqual([...allEnum].sort());
    // No duplicates
    expect(new Set(combined).size).toBe(combined.length);
  });
});

describe("logCronHeartbeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditLogCreateMany.mockResolvedValue({ count: 0 });
  });

  it("does not create audit logs when results are empty", async () => {
    const { logCronHeartbeat } = await import("@/lib/cron-auth");
    await logCronHeartbeat([]);
    expect(auditLogCreateMany).not.toHaveBeenCalled();
  });

  it("aggregates results by orgId and creates audit logs", async () => {
    const { logCronHeartbeat } = await import("@/lib/cron-auth");
    await logCronHeartbeat([
      { orgId: "org-1", appId: "app-1", status: "HEALTHY" },
      { orgId: "org-1", appId: "app-2", status: "CRITICAL" },
      { orgId: "org-2", appId: "app-3", status: "WARNING" },
    ]);

    expect(auditLogCreateMany).toHaveBeenCalledOnce();
    const [args] = auditLogCreateMany.mock.calls[0];
    expect(args.data).toHaveLength(2);

    const org1 = args.data.find((d: { orgId: string }) => d.orgId === "org-1");
    const parsed = JSON.parse(org1.details);
    expect(parsed.processed).toBe(2);
    expect(parsed.critical).toBe(1);
  });
});
