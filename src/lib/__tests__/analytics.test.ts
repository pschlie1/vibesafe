import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockAuditLogCreate } = vi.hoisted(() => ({
  mockAuditLogCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: mockAuditLogCreate,
    },
  },
}));

// ---------------------------------------------------------------------------
// Import under test
// ---------------------------------------------------------------------------

import { trackEvent } from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("trackEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.INTERNAL_ANALYTICS_ENABLED;
  });

  it("does not write to DB when analytics are disabled (default off)", async () => {
    delete process.env.INTERNAL_ANALYTICS_ENABLED;

    await trackEvent({ event: "signup_completed", orgId: "org_1" });

    expect(mockAuditLogCreate).not.toHaveBeenCalled();
  });

  it("writes AuditLog row when analytics are enabled", async () => {
    process.env.INTERNAL_ANALYTICS_ENABLED = "1";
    mockAuditLogCreate.mockResolvedValue({});

    await trackEvent({ event: "scan_triggered", orgId: "org_2", userId: "user_99" });

    expect(mockAuditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: "org_2",
          userId: "user_99",
          action: "ANALYTICS_EVENT",
          resource: "scan_triggered",
        }),
      }),
    );
  });

  it("redacts sensitive property keys from the details payload", async () => {
    process.env.INTERNAL_ANALYTICS_ENABLED = "1";
    mockAuditLogCreate.mockResolvedValue({});

    await trackEvent({
      event: "app_created",
      orgId: "org_3",
      properties: {
        tier: "PRO",
        count: 5,
        email: "secret@example.com",
        token: "tok_abc",
        secretKey: "s3cr3t",
      },
    });

    const details = JSON.parse(mockAuditLogCreate.mock.calls[0][0].data.details);
    expect(details.properties.tier).toBe("PRO");
    expect(details.properties.count).toBe(5);
    expect(details.properties.email).toBeUndefined();
    expect(details.properties.token).toBeUndefined();
    expect(details.properties.secretKey).toBeUndefined();
  });

  it("does not throw when DB write fails (non-blocking)", async () => {
    process.env.INTERNAL_ANALYTICS_ENABLED = "1";
    mockAuditLogCreate.mockRejectedValue(new Error("DB down"));

    await expect(
      trackEvent({ event: "finding_resolved", orgId: "org_4" }),
    ).resolves.toBeUndefined();
  });
});
