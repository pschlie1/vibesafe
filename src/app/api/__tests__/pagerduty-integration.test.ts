/**
 * pagerduty-integration.test.ts
 *
 * Tests for PagerDuty incident integration.
 * Covers: tier gating (ENTERPRISE-only), CRUD, test incident creation.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Auth mocks ───────────────────────────────────────────────────────────────
const requireRole = vi.fn();
vi.mock("@/lib/auth", () => ({ requireRole }));

// ─── Tenant mocks ─────────────────────────────────────────────────────────────
const getOrgLimits = vi.fn();
vi.mock("@/lib/tenant", () => ({ getOrgLimits }));

// ─── DB mocks ─────────────────────────────────────────────────────────────────
const integrationConfigFindUnique = vi.fn();
const integrationConfigUpsert = vi.fn();
const integrationConfigDeleteMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    integrationConfig: {
      findUnique: integrationConfigFindUnique,
      upsert: integrationConfigUpsert,
      deleteMany: integrationConfigDeleteMany,
    },
  },
}));

// ─── Crypto mocks ─────────────────────────────────────────────────────────────
vi.mock("@/lib/crypto-util", () => ({
  encrypt: vi.fn((v: string) => `enc:${v}`),
  decrypt: vi.fn((v: string) => v.replace("enc:", "")),
  obfuscate: vi.fn((v: string) => `enc:${v}`),
  deobfuscate: vi.fn((v: string) => v.replace("enc:", "")),
}));

// ─── PagerDuty notify mock ────────────────────────────────────────────────────
const createPagerDutyIncident = vi.fn();
vi.mock("@/lib/pagerduty-notify", () => ({ createPagerDutyIncident }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeSession(role = "OWNER") {
  return { userId: "user-1", orgId: "org-1", role };
}

function makeLimits(tier: string) {
  return { tier, maxApps: 5, maxUsers: 5 };
}

function makeRequest(body?: unknown): Request {
  return new Request("http://localhost/api/integrations/pagerduty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const VALID_ROUTING_KEY = "abcdef1234567890abcdef12"; // 24 chars

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  requireRole.mockRejectedValue(new Error("Unauthorized"));
  getOrgLimits.mockResolvedValue(makeLimits("FREE"));
});

describe("GET /api/integrations/pagerduty", () => {
  it("returns 403 for PRO tier (PagerDuty is ENTERPRISE-only)", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    getOrgLimits.mockResolvedValue(makeLimits("PRO"));
    const { GET } = await import("@/app/api/integrations/pagerduty/route");
    const res = await GET();
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("Enterprise plans");
  });

  it("returns 403 for FREE tier", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    getOrgLimits.mockResolvedValue(makeLimits("FREE"));
    const { GET } = await import("@/app/api/integrations/pagerduty/route");
    const res = await GET();
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("PagerDuty integration");
  });

  it("returns 200 with masked routing key for ENTERPRISE tier", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    getOrgLimits.mockResolvedValue(makeLimits("ENTERPRISE"));
    integrationConfigFindUnique.mockResolvedValue({
      id: "int-1",
      orgId: "org-1",
      type: "pagerduty",
      enabled: true,
      config: { routingKey: `enc:${VALID_ROUTING_KEY}` },
    });
    const { GET } = await import("@/app/api/integrations/pagerduty/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.routingKey).toContain("••••");
    expect(json.routingKey).not.toBe(VALID_ROUTING_KEY);
    expect(json.enabled).toBe(true);
  });

  it("returns null when no config exists for ENTERPRISE tier", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    getOrgLimits.mockResolvedValue(makeLimits("ENTERPRISE"));
    integrationConfigFindUnique.mockResolvedValue(null);
    const { GET } = await import("@/app/api/integrations/pagerduty/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toBeNull();
  });

  it("returns 401 without session", async () => {
    requireRole.mockRejectedValue(new Error("Unauthorized"));
    const { GET } = await import("@/app/api/integrations/pagerduty/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/integrations/pagerduty", () => {
  it("saves config with valid routing key for ENTERPRISE", async () => {
    requireRole.mockResolvedValue(makeSession("ADMIN"));
    getOrgLimits.mockResolvedValue(makeLimits("ENTERPRISE"));
    integrationConfigUpsert.mockResolvedValue({ id: "int-1", orgId: "org-1" });
    const { POST } = await import("@/app/api/integrations/pagerduty/route");
    const req = makeRequest({ routingKey: VALID_ROUTING_KEY });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(integrationConfigUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ orgId: "org-1", type: "pagerduty" }),
      }),
    );
  });

  it("returns 403 for PRO tier", async () => {
    requireRole.mockResolvedValue(makeSession("ADMIN"));
    getOrgLimits.mockResolvedValue(makeLimits("PRO"));
    const { POST } = await import("@/app/api/integrations/pagerduty/route");
    const req = makeRequest({ routingKey: VALID_ROUTING_KEY });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("Enterprise plans");
  });

  it("returns 400 for short routing key", async () => {
    requireRole.mockResolvedValue(makeSession("ADMIN"));
    getOrgLimits.mockResolvedValue(makeLimits("ENTERPRISE"));
    const { POST } = await import("@/app/api/integrations/pagerduty/route");
    const req = makeRequest({ routingKey: "tooshort" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("saves config with optional serviceId", async () => {
    requireRole.mockResolvedValue(makeSession("ADMIN"));
    getOrgLimits.mockResolvedValue(makeLimits("ENTERPRISE_PLUS"));
    integrationConfigUpsert.mockResolvedValue({ id: "int-1", orgId: "org-1" });
    const { POST } = await import("@/app/api/integrations/pagerduty/route");
    const req = makeRequest({ routingKey: VALID_ROUTING_KEY, serviceId: "PABC123" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/integrations/pagerduty", () => {
  it("removes config for OWNER with ENTERPRISE tier", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    getOrgLimits.mockResolvedValue(makeLimits("ENTERPRISE"));
    integrationConfigDeleteMany.mockResolvedValue({ count: 1 });
    const { DELETE } = await import("@/app/api/integrations/pagerduty/route");
    const res = await DELETE();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(integrationConfigDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orgId: "org-1", type: "pagerduty" } }),
    );
  });

  it("returns 403 for PRO tier", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    getOrgLimits.mockResolvedValue(makeLimits("PRO"));
    const { DELETE } = await import("@/app/api/integrations/pagerduty/route");
    const res = await DELETE();
    expect(res.status).toBe(403);
  });
});

describe("POST /api/integrations/pagerduty/test", () => {
  it("returns 404 if no config exists", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    integrationConfigFindUnique.mockResolvedValue(null);
    const { POST } = await import("@/app/api/integrations/pagerduty/test/route");
    const res = await POST();
    expect(res.status).toBe(404);
  });

  it("calls createPagerDutyIncident and returns deduplication key", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    integrationConfigFindUnique.mockResolvedValue({
      id: "int-1",
      orgId: "org-1",
      type: "pagerduty",
      enabled: true,
      config: { routingKey: `enc:${VALID_ROUTING_KEY}` },
    });
    createPagerDutyIncident.mockResolvedValue({ deduplicationKey: "dedup-key-123" });
    const { POST } = await import("@/app/api/integrations/pagerduty/test/route");
    const res = await POST();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.deduplicationKey).toBe("dedup-key-123");
    expect(createPagerDutyIncident).toHaveBeenCalledWith(
      VALID_ROUTING_KEY,
      expect.objectContaining({ severity: "info" }),
    );
  });

  it("returns 502 if createPagerDutyIncident fails", async () => {
    requireRole.mockResolvedValue(makeSession("OWNER"));
    integrationConfigFindUnique.mockResolvedValue({
      id: "int-1",
      orgId: "org-1",
      type: "pagerduty",
      enabled: true,
      config: { routingKey: `enc:${VALID_ROUTING_KEY}` },
    });
    createPagerDutyIncident.mockResolvedValue(null);
    const { POST } = await import("@/app/api/integrations/pagerduty/test/route");
    const res = await POST();
    expect(res.status).toBe(502);
  });

  it("returns 401 without session", async () => {
    requireRole.mockRejectedValue(new Error("Unauthorized"));
    const { POST } = await import("@/app/api/integrations/pagerduty/test/route");
    const res = await POST();
    expect(res.status).toBe(401);
  });
});
