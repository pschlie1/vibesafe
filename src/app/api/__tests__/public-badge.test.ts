/**
 * public-badge.test.ts
 *
 * Tests for improved public security badge endpoint.
 * Covers: SVG output, shields.io format, JSON format, slug-based lookup.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── DB mocks ─────────────────────────────────────────────────────────────────
const apiKeyFindFirst = vi.fn();
const monitoredAppFindFirst = vi.fn();
const organizationFindUnique = vi.fn();
const monitoredAppFindMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    apiKey: { findFirst: apiKeyFindFirst },
    monitoredApp: {
      findFirst: monitoredAppFindFirst,
      findMany: monitoredAppFindMany,
    },
    organization: { findUnique: organizationFindUnique },
  },
}));

// ─── Crypto (real, no mock needed) ────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(params: Record<string, string> = {}, headers: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/public/badge");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { headers });
}

function makeApp(findings: { severity: string }[]) {
  return {
    id: "app-1",
    url: "https://example.com",
    monitorRuns: [
      {
        startedAt: new Date(),
        findings,
      },
    ],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  apiKeyFindFirst.mockResolvedValue(null);
  monitoredAppFindFirst.mockResolvedValue(null);
  organizationFindUnique.mockResolvedValue(null);
  monitoredAppFindMany.mockResolvedValue([]);
});

describe("GET /api/public/badge", () => {
  it("returns SVG by default when no key provided", async () => {
    const { GET } = await import("@/app/api/public/badge/route");
    const req = makeRequest({ url: "https://example.com" });
    const res = await GET(req);
    expect(res.headers.get("content-type")).toContain("svg");
    const body = await res.text();
    expect(body).toContain("<svg");
    expect(body).toContain("</svg>");
  });

  it("returns SVG with score for valid key and app data", async () => {
    apiKeyFindFirst.mockResolvedValue({ orgId: "org-1", expiresAt: null });
    monitoredAppFindFirst.mockResolvedValue(
      makeApp([{ severity: "HIGH" }, { severity: "MEDIUM" }]),
    );
    const { GET } = await import("@/app/api/public/badge/route");
    const req = makeRequest(
      { url: "https://example.com" },
      { Authorization: "Bearer mykey" },
    );
    const res = await GET(req);
    expect(res.headers.get("content-type")).toContain("svg");
    const body = await res.text();
    expect(body).toContain("<svg");
    // Score should be 100 - 10 - 5 = 85 → grade B
    expect(body).toContain("85");
    expect(body).toContain("B");
  });

  it("returns shields.io-compatible JSON for format=shield", async () => {
    apiKeyFindFirst.mockResolvedValue({ orgId: "org-1", expiresAt: null });
    monitoredAppFindFirst.mockResolvedValue(makeApp([])); // no findings → score 100, grade A
    const { GET } = await import("@/app/api/public/badge/route");
    const req = makeRequest(
      { url: "https://example.com", format: "shield" },
      { Authorization: "Bearer mykey" },
    );
    const res = await GET(req);
    expect(res.headers.get("content-type")).toContain("json");
    const json = await res.json();
    expect(json).toHaveProperty("schemaVersion", 1);
    expect(json).toHaveProperty("label", "Scantient");
    expect(json).toHaveProperty("message");
    expect(json.message).toContain("100");
    expect(json.message).toContain("A");
    expect(json).toHaveProperty("color");
  });

  it("returns raw score data for format=json", async () => {
    apiKeyFindFirst.mockResolvedValue({ orgId: "org-1", expiresAt: null });
    monitoredAppFindFirst.mockResolvedValue(makeApp([{ severity: "CRITICAL" }]));
    const { GET } = await import("@/app/api/public/badge/route");
    const req = makeRequest(
      { url: "https://example.com", format: "json" },
      { Authorization: "Bearer mykey" },
    );
    const res = await GET(req);
    const json = await res.json();
    expect(json).toHaveProperty("score");
    expect(json).toHaveProperty("grade");
    expect(json).toHaveProperty("status");
    expect(json.score).toBe(75); // 100 - 25 = 75
    expect(json.grade).toBe("C");
    expect(json.status).toBe("warning");
  });

  it("returns grey shield when no data for format=shield without key", async () => {
    const { GET } = await import("@/app/api/public/badge/route");
    const req = makeRequest({ format: "shield" });
    const res = await GET(req);
    const json = await res.json();
    expect(json.schemaVersion).toBe(1);
    expect(json.color).toBe("grey");
  });
});

describe("GET /api/public/badge/[slug]", () => {
  function makeSlugRequest(slug: string, params: Record<string, string> = {}): Request {
    const url = new URL(`http://localhost/api/public/badge/${slug}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return new Request(url.toString());
  }

  function makeParams(slug = "acme-corp") {
    return { params: Promise.resolve({ slug }) };
  }

  it("returns SVG for org with scan data", async () => {
    organizationFindUnique.mockResolvedValue({ id: "org-1", name: "Acme Corp" });
    monitoredAppFindMany.mockResolvedValue([
      { id: "app-1", monitorRuns: [{ findings: [], startedAt: new Date() }] },
    ]);
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const req = makeSlugRequest("acme-corp");
    const res = await GET(req, makeParams());
    expect(res.headers.get("content-type")).toContain("svg");
    const body = await res.text();
    expect(body).toContain("<svg");
    expect(body).toContain("100");
  });

  it("returns shields.io JSON for format=shield", async () => {
    organizationFindUnique.mockResolvedValue({ id: "org-1", name: "Acme Corp" });
    monitoredAppFindMany.mockResolvedValue([
      { id: "app-1", monitorRuns: [{ findings: [{ severity: "HIGH" }], startedAt: new Date() }] },
    ]);
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const req = makeSlugRequest("acme-corp", { format: "shield" });
    const res = await GET(req, makeParams());
    const json = await res.json();
    expect(json.schemaVersion).toBe(1);
    expect(json.label).toBe("Scantient");
    expect(json.message).toContain("90"); // 100 - 10 = 90 → B
    expect(["brightgreen", "yellow", "red"]).toContain(json.color);
  });

  it("returns 404 JSON for unknown slug with format=json", async () => {
    organizationFindUnique.mockResolvedValue(null);
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const req = makeSlugRequest("unknown-org", { format: "json" });
    const res = await GET(req, makeParams("unknown-org"));
    expect(res.status).toBe(404);
  });

  it("returns SVG for unknown slug (graceful)", async () => {
    organizationFindUnique.mockResolvedValue(null);
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const req = makeSlugRequest("unknown-org");
    const res = await GET(req, makeParams("unknown-org"));
    expect(res.headers.get("content-type")).toContain("svg");
    const body = await res.text();
    expect(body).toContain("<svg");
  });

  it("returns JSON with org score data for format=json", async () => {
    organizationFindUnique.mockResolvedValue({ id: "org-1", name: "Acme Corp" });
    monitoredAppFindMany.mockResolvedValue([
      { id: "app-1", monitorRuns: [{ findings: [], startedAt: new Date() }] },
      { id: "app-2", monitorRuns: [{ findings: [{ severity: "HIGH" }], startedAt: new Date() }] },
    ]);
    const { GET } = await import("@/app/api/public/badge/[slug]/route");
    const req = makeSlugRequest("acme-corp", { format: "json" });
    const res = await GET(req, makeParams());
    const json = await res.json();
    expect(json.org).toBe("Acme Corp");
    expect(json.score).toBeDefined();
    expect(json.grade).toBeDefined();
    expect(json.appsScanned).toBe(2);
  });
});
