/**
 * security-audit-16.test.ts
 *
 * Tests for Audit-16 security fixes:
 *  1. API key revocation on team member removal (Focus 5)
 *  2. Badge slug rate limiting (Focus 6)
 *  3. Badge slug JSON format exposes org.name — acceptable by design (public badge)
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Rate limit ───────────────────────────────────────────────────────────────
const checkRateLimit = vi.fn();
const getClientIp = vi.fn();
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit, getClientIp }));

// ─── Auth mock ────────────────────────────────────────────────────────────────
const getSession = vi.fn();
vi.mock("@/lib/auth", () => ({ getSession }));

// ─── Tenant mock ─────────────────────────────────────────────────────────────
const logAudit = vi.fn();
vi.mock("@/lib/tenant", () => ({ logAudit }));

// ─── DB mocks ─────────────────────────────────────────────────────────────────
const userFindFirst = vi.fn();
const userDelete = vi.fn();
const apiKeyDeleteMany = vi.fn();
const organizationFindUnique = vi.fn();
const monitoredAppFindMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: { findFirst: userFindFirst, delete: userDelete },
    apiKey: { deleteMany: apiKeyDeleteMany },
    organization: { findUnique: organizationFindUnique },
    monitoredApp: { findMany: monitoredAppFindMany },
  },
}));

// ─── CORS mock ───────────────────────────────────────────────────────────────
vi.mock("@/lib/cors", () => ({
  applyCors: vi.fn((res: Response) => res),
  corsPreflightResponse: vi.fn(() => new Response(null, { status: 204 })),
  CORS_HEADERS_PUBLIC: {},
}));

// ─── badge/route helpers — real implementations ───────────────────────────────
vi.mock("@/app/api/public/badge/route", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/app/api/public/badge/route")>();
  return {
    calcScore: real.calcScore,
    scoreToGrade: real.scoreToGrade,
    scoreToColor: real.scoreToColor,
    makeBadgeSvg: real.makeBadgeSvg,
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ownerSession = { id: "owner_1", orgId: "org_a", role: "OWNER", name: "Owner", email: "owner@example.com" };
const memberTarget = { id: "member_1", email: "member@example.com", role: "MEMBER", orgId: "org_a" };

function makeTeamRequest(method: string) {
  return new Request(`http://localhost/api/team/member_1`, { method });
}

function makeBadgeSlugRequest(slug: string, format?: string): Request {
  const url = `http://localhost/api/public/badge/${slug}${format ? `?format=${format}` : ""}`;
  return new Request(url, { headers: { "x-forwarded-for": "1.2.3.4" } });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: rate limit allowed
  checkRateLimit.mockResolvedValue({ allowed: true });
  getClientIp.mockReturnValue("1.2.3.4");
  // Default auth
  getSession.mockResolvedValue(ownerSession);
  // Default DB
  userFindFirst.mockResolvedValue(memberTarget);
  userDelete.mockResolvedValue({});
  apiKeyDeleteMany.mockResolvedValue({ count: 0 });
  logAudit.mockResolvedValue(undefined);
  // Badge defaults
  organizationFindUnique.mockResolvedValue({ id: "org_a", name: "Acme Corp" });
  monitoredAppFindMany.mockResolvedValue([
    {
      monitorRuns: [
        { findings: [{ severity: "HIGH" }, { severity: "LOW" }] },
      ],
    },
  ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Focus 5: API key revocation on team member removal
// ─────────────────────────────────────────────────────────────────────────────
describe("Focus 5: DELETE /api/team/[id] — API key revocation", () => {
  it("deletes API keys created by removed user before deleting the user", async () => {
    apiKeyDeleteMany.mockResolvedValue({ count: 3 });
    const { DELETE } = await import("@/app/api/team/[id]/route");
    const res = await DELETE(makeTeamRequest("DELETE"), {
      params: Promise.resolve({ id: "member_1" }),
    });
    expect(res.status).toBe(200);
    // apiKey.deleteMany must be called with the removed user's id and org scope
    expect(apiKeyDeleteMany).toHaveBeenCalledWith({
      where: { createdByUserId: "member_1", orgId: "org_a" },
    });
    // user.delete must be called AFTER apiKey.deleteMany
    expect(userDelete).toHaveBeenCalledWith({ where: { id: "member_1" } });
  });

  it("proceeds normally when removed user has no API keys (count: 0)", async () => {
    apiKeyDeleteMany.mockResolvedValue({ count: 0 });
    const { DELETE } = await import("@/app/api/team/[id]/route");
    const res = await DELETE(makeTeamRequest("DELETE"), {
      params: Promise.resolve({ id: "member_1" }),
    });
    expect(res.status).toBe(200);
    expect(apiKeyDeleteMany).toHaveBeenCalledOnce();
    expect(userDelete).toHaveBeenCalledOnce();
  });

  it("does NOT delete API keys when member not found (returns 404 early)", async () => {
    userFindFirst.mockResolvedValue(null); // member not in org
    const { DELETE } = await import("@/app/api/team/[id]/route");
    const res = await DELETE(makeTeamRequest("DELETE"), {
      params: Promise.resolve({ id: "member_1" }),
    });
    expect(res.status).toBe(404);
    expect(apiKeyDeleteMany).not.toHaveBeenCalled();
    expect(userDelete).not.toHaveBeenCalled();
  });

  it("does NOT delete API keys when trying to remove OWNER (returns 403 early)", async () => {
    userFindFirst.mockResolvedValue({ ...memberTarget, role: "OWNER" });
    const { DELETE } = await import("@/app/api/team/[id]/route");
    const res = await DELETE(makeTeamRequest("DELETE"), {
      params: Promise.resolve({ id: "member_1" }),
    });
    expect(res.status).toBe(403);
    expect(apiKeyDeleteMany).not.toHaveBeenCalled();
    expect(userDelete).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    getSession.mockResolvedValue(null);
    const { DELETE } = await import("@/app/api/team/[id]/route");
    const res = await DELETE(makeTeamRequest("DELETE"), {
      params: Promise.resolve({ id: "member_1" }),
    });
    expect(res.status).toBe(401);
    expect(apiKeyDeleteMany).not.toHaveBeenCalled();
  });

  it("returns 403 when MEMBER tries to remove another MEMBER", async () => {
    getSession.mockResolvedValue({ ...ownerSession, role: "MEMBER" });
    const { DELETE } = await import("@/app/api/team/[id]/route");
    const res = await DELETE(makeTeamRequest("DELETE"), {
      params: Promise.resolve({ id: "member_1" }),
    });
    expect(res.status).toBe(403);
    expect(apiKeyDeleteMany).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Focus 6: Badge slug — rate limiting
// ─────────────────────────────────────────────────────────────────────────────
describe("Focus 6: GET /api/public/badge/[slug] — rate limiting", () => {
  it("returns 429 JSON when rate limit exceeded", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 30 });
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const res = await GET(makeBadgeSlugRequest("acme-corp", "json"), {
      params: Promise.resolve({ slug: "acme-corp" }),
    });
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/rate limit/i);
    // DB should NOT be hit when rate limited
    expect(organizationFindUnique).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After header when rate limited", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 45 });
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const res = await GET(makeBadgeSlugRequest("acme-corp"), {
      params: Promise.resolve({ slug: "acme-corp" }),
    });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("45");
  });

  it("rate-limits by IP — calls checkRateLimit with IP-keyed bucket", async () => {
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    await GET(makeBadgeSlugRequest("acme-corp"), {
      params: Promise.resolve({ slug: "acme-corp" }),
    });
    expect(checkRateLimit).toHaveBeenCalledWith(
      "badge-slug:1.2.3.4",
      expect.objectContaining({ maxAttempts: 20, windowMs: 60 * 1000 }),
    );
  });

  it("returns SVG badge successfully when rate limit is not exceeded", async () => {
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const res = await GET(makeBadgeSlugRequest("acme-corp"), {
      params: Promise.resolve({ slug: "acme-corp" }),
    });
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type");
    expect(contentType).toContain("image/svg+xml");
  });

  it("returns 404 JSON when org slug not found", async () => {
    organizationFindUnique.mockResolvedValue(null);
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const res = await GET(makeBadgeSlugRequest("nonexistent-org", "json"), {
      params: Promise.resolve({ slug: "nonexistent-org" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns JSON with org score data (public by design)", async () => {
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const res = await GET(makeBadgeSlugRequest("acme-corp", "json"), {
      params: Promise.resolve({ slug: "acme-corp" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    // Badge intentionally exposes org name + score for public embedding
    expect(body).toHaveProperty("org");
    expect(body).toHaveProperty("score");
    expect(body).toHaveProperty("grade");
  });
});
