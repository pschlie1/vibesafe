/**
 * scanner-http.test.ts
 * Unit tests for runDueHttpScans (and indirectly runHttpScanForApp).
 *
 * NOTE: calcStatus and dedup are internal (not exported). They are tested
 * indirectly through the public API behavior.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── DB mocks ──────────────────────────────────────────────────────────────────
const monitoredAppFindMany = vi.fn();
const monitoredAppFindUnique = vi.fn();
const monitoredAppUpdate = vi.fn();
const monitoredAppUpdateMany = vi.fn();
const monitorRunCreate = vi.fn();
const monitorRunUpdate = vi.fn();
const dbTransaction = vi.fn();
const auditLogFindFirst = vi.fn();
const auditLogCreate = vi.fn();
const auditLogCreateMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: dbTransaction,
    monitoredApp: {
      findMany: monitoredAppFindMany,
      findUnique: monitoredAppFindUnique,
      update: monitoredAppUpdate,
      updateMany: monitoredAppUpdateMany,
    },
    monitorRun: {
      create: monitorRunCreate,
      update: monitorRunUpdate,
    },
    auditLog: {
      findFirst: auditLogFindFirst,
      create: auditLogCreate,
      createMany: auditLogCreateMany,
    },
  },
}));

// ── Security mocks (all check functions return empty arrays by default) ───────
vi.mock("@/lib/security", () => ({
  checkAPISecurity: vi.fn().mockReturnValue([]),
  checkBrokenLinks: vi.fn().mockResolvedValue([]),
  checkClientSideAuthBypass: vi.fn().mockReturnValue([]),
  checkCookieSecurity: vi.fn().mockReturnValue([]),
  checkCORSMisconfiguration: vi.fn().mockReturnValue([]),
  checkDependencyExposure: vi.fn().mockReturnValue([]),
  checkDependencyVersions: vi.fn().mockReturnValue([]),
  checkExposedEndpoints: vi.fn().mockResolvedValue([]),
  checkFormSecurity: vi.fn().mockReturnValue([]),
  checkInformationDisclosure: vi.fn().mockReturnValue([]),
  checkInlineScripts: vi.fn().mockReturnValue([]),
  checkInlineScriptCount: vi.fn().mockReturnValue([]),
  checkMetaAndConfig: vi.fn().mockReturnValue([]),
  checkOpenRedirects: vi.fn().mockReturnValue([]),
  checkPerformanceRegression: vi.fn().mockResolvedValue([]),
  checkSecurityHeaders: vi.fn().mockReturnValue([]),
  checkSSLCertExpiry: vi.fn().mockResolvedValue([]),
  checkSSLIssues: vi.fn().mockReturnValue([]),
  checkThirdPartyScripts: vi.fn().mockReturnValue([]),
  checkUptimeStatus: vi.fn().mockReturnValue([]),
  scanJavaScriptForKeys: vi.fn().mockReturnValue([]),
}));

vi.mock("@/lib/content-hash", () => ({ computeContentHash: vi.fn().mockReturnValue("abc123") }));
vi.mock("@/lib/alerts", () => ({ sendCriticalFindingsAlert: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/tenant", () => ({ getOrgLimits: vi.fn().mockResolvedValue({ tier: "FREE" }) }));
vi.mock("@/lib/remediation-lifecycle", () => ({
  autoTriageFinding: vi.fn().mockResolvedValue(undefined),
  verifyResolvedFindings: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/ai-policy-scanner", () => ({ checkAITools: vi.fn().mockReturnValue([]) }));
vi.mock("@/lib/endpoint-discovery", () => ({ discoverEndpoints: vi.fn().mockResolvedValue([]) }));
vi.mock("@/lib/scanner-auth", () => ({ runAuthScan: vi.fn().mockResolvedValue([]) }));

// ── SSRF guard mocks ──────────────────────────────────────────────────────────
const mockSsrfSafeFetch = vi.fn();
const mockIsPrivateUrl = vi.fn();
vi.mock("@/lib/ssrf-guard", () => ({
  ssrfSafeFetch: (...args: unknown[]) => mockSsrfSafeFetch(...args),
  isPrivateUrl: (...args: unknown[]) => mockIsPrivateUrl(...args),
}));

// ── Bot challenge detector mock ───────────────────────────────────────────────
vi.mock("@/lib/bot-challenge-detector", () => ({
  detectBotChallenge: vi.fn().mockReturnValue({ challenged: false }),
}));

// ── probe-client mock ─────────────────────────────────────────────────────────
vi.mock("@/lib/probe-client", () => ({
  runProbe: vi.fn().mockResolvedValue(null),
}));

// ── crypto-util / auth-headers mocks ─────────────────────────────────────────
vi.mock("@/lib/crypto-util", () => ({
  decrypt: vi.fn().mockReturnValue("decrypted-token"),
}));
vi.mock("@/lib/auth-headers", () => ({
  decryptAuthHeaders: vi.fn().mockReturnValue([]),
}));

// ── Finding mock (upsert) ─────────────────────────────────────────────────────
const findingUpsert = vi.fn().mockResolvedValue({});
const monitorRunFindUnique = vi.fn().mockResolvedValue({ id: "run_1", findings: [] });

// Extend the db mock to include finding
vi.mock("@/lib/db", () => ({
  db: {
    $transaction: dbTransaction,
    monitoredApp: {
      findMany: monitoredAppFindMany,
      findUnique: monitoredAppFindUnique,
      update: monitoredAppUpdate,
      updateMany: monitoredAppUpdateMany,
    },
    monitorRun: {
      create: monitorRunCreate,
      update: monitorRunUpdate,
      findUnique: monitorRunFindUnique,
    },
    auditLog: {
      findFirst: auditLogFindFirst,
      create: auditLogCreate,
      createMany: auditLogCreateMany,
    },
    finding: {
      upsert: findingUpsert,
    },
  },
}));

// ── Default happy-path mock response ─────────────────────────────────────────
function makeOkResponse(body = "<html><head></head><body>Hello</body></html>") {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/html" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  // Default transaction delegates to real callback with tx that mirrors top-level mocks.
  // Two separate $transaction calls exist in runDueHttpScans:
  //   1. app claiming (uses findMany + updateMany)
  //   2. scan completion write (uses monitorRun.update + monitorRun.findMany + monitoredApp.update)
  dbTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
    cb({
      monitoredApp: {
        findMany: monitoredAppFindMany,
        updateMany: monitoredAppUpdateMany,
        update: monitoredAppUpdate,
      },
      monitorRun: {
        update: monitorRunUpdate,
        findMany: vi.fn().mockResolvedValue([]),
      },
    }),
  );

  monitoredAppFindMany.mockResolvedValue([]);
  monitoredAppFindUnique.mockResolvedValue(null);
  monitorRunCreate.mockResolvedValue({ id: "run_1" });
  monitorRunUpdate.mockResolvedValue({});
  monitorRunFindUnique.mockResolvedValue({ id: "run_1", findings: [] });
  monitoredAppUpdate.mockResolvedValue({});
  monitoredAppUpdateMany.mockResolvedValue({ count: 0 });
  auditLogFindFirst.mockResolvedValue(null);
  auditLogCreate.mockResolvedValue({});
  auditLogCreateMany.mockResolvedValue({ count: 0 });
  findingUpsert.mockResolvedValue({});

  // Default SSRF guard: URLs are safe, fetch succeeds
  mockIsPrivateUrl.mockResolvedValue(false);
  mockSsrfSafeFetch.mockResolvedValue(makeOkResponse());
});

// ── Shared app fixture ────────────────────────────────────────────────────────
function makeApp(overrides: Record<string, unknown> = {}) {
  return {
    id: "app_ok",
    orgId: "org_b",
    url: "https://example.com",
    name: "Test App",
    ownerEmail: "owner@example.com",
    authHeaders: null,
    probeUrl: null,
    probeToken: null,
    nextCheckAt: null,
    ...overrides,
  };
}

describe("runDueHttpScans", () => {
  it("returns empty array when no due apps", async () => {
    monitoredAppFindMany.mockResolvedValueOnce([]);
    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();
    expect(results).toEqual([]);
    expect(monitoredAppFindMany).toHaveBeenCalledOnce();
  });

  it("handles individual app scan failure gracefully (one failure doesn't stop batch)", async () => {
    // Return two apps . findUnique returns null for both (causing "App not found" throw)
    monitoredAppFindMany.mockResolvedValueOnce([
      { id: "app_1", orgId: "org_a", nextCheckAt: null },
      { id: "app_2", orgId: "org_a", nextCheckAt: null },
    ]);
    monitoredAppFindUnique.mockResolvedValue(null); // triggers "App not found" error

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    // Both apps should appear in results with CRITICAL status
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("CRITICAL");
    expect(results[0].error).toBe("App not found");
    expect(results[1].status).toBe("CRITICAL");
    expect(results[1].error).toBe("App not found");
  });

  it("processes apps in batches of 5 (concurrency=5)", async () => {
    // 6 apps . 1st batch of 5, then 1 more
    const apps = Array.from({ length: 6 }, (_, i) => ({
      id: `app_${i + 1}`,
      orgId: "org_a",
      nextCheckAt: null,
    }));
    monitoredAppFindMany.mockResolvedValueOnce(apps);
    monitoredAppFindUnique.mockResolvedValue(null); // all fail with "App not found"

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans(10); // limit=10

    // All 6 apps should be processed despite batching
    expect(results).toHaveLength(6);
    expect(results.every((r) => r.status === "CRITICAL")).toBe(true);
  });

  it("successful scan returns status and findingsCount in results", async () => {
    const app = makeApp();
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_ok" });
    monitorRunUpdate.mockResolvedValueOnce({ id: "run_ok" });
    monitoredAppUpdate.mockResolvedValueOnce({});

    mockSsrfSafeFetch.mockResolvedValueOnce(makeOkResponse("<html><head></head><body>Hello</body></html>"));

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    expect(results).toHaveLength(1);
    expect(results[0].appId).toBe("app_ok");
    expect(["HEALTHY", "WARNING", "CRITICAL"]).toContain(results[0].status);
  });

  // ── Test 5: ssrfSafeFetch throws ECONNREFUSED ─────────────────────────────
  it("ssrfSafeFetch ECONNREFUSED → scan result is CRITICAL with error captured", async () => {
    const app = makeApp();
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_econnrefused" });

    mockIsPrivateUrl.mockResolvedValue(false);
    mockSsrfSafeFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("CRITICAL");
    expect(results[0].error).toBe("ECONNREFUSED");

    // monitorRun.update should have been called with CRITICAL status
    expect(monitorRunUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "CRITICAL" }),
      }),
    );
  });

  // ── Test 6: ssrfSafeFetch throws AbortError (30s timeout) ────────────────
  it("ssrfSafeFetch AbortError → scan result is CRITICAL", async () => {
    const app = makeApp();
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_abort" });

    mockIsPrivateUrl.mockResolvedValue(false);
    const abortErr = Object.assign(new Error("fetch timeout"), { name: "AbortError" });
    mockSsrfSafeFetch.mockRejectedValueOnce(abortErr);

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("CRITICAL");
    expect(results[0].error).toBe("fetch timeout");
  });

  // ── Test 7: probe URL fetch throws → falls back, scan continues ──────────
  it("probe URL fetch failure → gracefully falls back to browser scan path, scan completes", async () => {
    // App with probeUrl + probeToken configured
    const app = makeApp({ probeUrl: "https://example.com/api/scantient-probe", probeToken: "encrypted-token" });
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_probe_fail" });

    // Simulate bot challenge so the probe path is exercised
    const { detectBotChallenge } = await import("@/lib/bot-challenge-detector");
    vi.mocked(detectBotChallenge).mockReturnValueOnce({ challenged: true, provider: "Cloudflare" });

    // ssrfSafeFetch returns successfully (main fetch)
    mockIsPrivateUrl.mockResolvedValue(false);
    mockSsrfSafeFetch.mockResolvedValueOnce(makeOkResponse("<html>cf block</html>"));

    // global fetch (probe) throws — scan should fall back to browser scan
    const mockBrowserScan = vi.fn().mockResolvedValue({
      html: "<html><head></head><body>Bypassed</body></html>",
      statusCode: 200,
      headers: new Headers({ "content-type": "text/html" }),
      jsPayloads: [],
    });
    vi.doMock("@/lib/scanner-browser", () => ({ runBrowserScan: mockBrowserScan }));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("probe connection refused")),
    );

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    // Scan should complete (not crash) even when probe fetch throws
    expect(results).toHaveLength(1);
    expect(["HEALTHY", "WARNING", "CRITICAL"]).toContain(results[0].status);

    vi.unstubAllGlobals();
  });

  // ── Test 8: isPrivateUrl returns true → SSRF error ───────────────────────
  it("private URL → isPrivateUrl returns true → scan errors with SSRF message", async () => {
    const app = makeApp({ url: "http://192.168.1.1" });
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_ssrf" });

    mockIsPrivateUrl.mockResolvedValue(true); // SSRF guard triggers

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("CRITICAL");
    expect(results[0].error).toContain("SSRF");
    // ssrfSafeFetch should not have been called
    expect(mockSsrfSafeFetch).not.toHaveBeenCalled();
  });

  // ── Test 9: ssrfSafeFetch returns 404 → CRITICAL finding ─────────────────
  it("ssrfSafeFetch returns 404 → checkUptimeStatus called, scan records CRITICAL", async () => {
    const { checkUptimeStatus } = await import("@/lib/security");

    // Make checkUptimeStatus return a CRITICAL finding for 404
    vi.mocked(checkUptimeStatus).mockReturnValueOnce([
      {
        code: "UPTIME_FAILURE",
        title: "Site returned HTTP 404",
        description: "The site returned a 404 Not Found response.",
        severity: "CRITICAL",
        fixPrompt: "Check deployment.",
      },
    ]);

    const app = makeApp();
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_404" });

    mockIsPrivateUrl.mockResolvedValue(false);
    mockSsrfSafeFetch.mockResolvedValueOnce(
      new Response("Not Found", { status: 404, headers: { "content-type": "text/html" } }),
    );

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    expect(results).toHaveLength(1);
    // With a CRITICAL finding from checkUptimeStatus, status should be CRITICAL
    expect(results[0].status).toBe("CRITICAL");
    expect(checkUptimeStatus).toHaveBeenCalledWith(404, expect.any(Number));
  });

  // ── Test 10: ssrfSafeFetch returns 500 → CRITICAL status ─────────────────
  it("ssrfSafeFetch returns 500 → scan records CRITICAL status", async () => {
    const { checkUptimeStatus } = await import("@/lib/security");

    vi.mocked(checkUptimeStatus).mockReturnValueOnce([
      {
        code: "UPTIME_FAILURE",
        title: "Site returned HTTP 500",
        description: "The site returned a 500 Internal Server Error.",
        severity: "CRITICAL",
        fixPrompt: "Check server logs.",
      },
    ]);

    const app = makeApp();
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_500" });

    mockIsPrivateUrl.mockResolvedValue(false);
    mockSsrfSafeFetch.mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500, headers: { "content-type": "text/html" } }),
    );

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("CRITICAL");
  });

  // ── Test 11: content hash dedup (same hash as last scan) ─────────────────
  it("same content hash as last auditLog → scan completes without crash", async () => {
    const { computeContentHash } = await import("@/lib/content-hash");
    vi.mocked(computeContentHash).mockReturnValue("same-hash-xyz");

    // Last audit log returns a matching hash
    auditLogFindFirst.mockResolvedValueOnce({
      id: "log_1",
      details: "same-hash-xyz", // same hash → no CONTENT_CHANGED finding
      createdAt: new Date(),
    });

    const app = makeApp();
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_dedup" });

    mockIsPrivateUrl.mockResolvedValue(false);
    mockSsrfSafeFetch.mockResolvedValueOnce(makeOkResponse());

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    expect(results).toHaveLength(1);
    // Should complete (not crash). findingsCount may be 0 since no new content change.
    expect(results[0].appId).toBe("app_ok");
    expect(typeof results[0].findingsCount).toBe("number");
    // CONTENT_CHANGED finding should NOT be injected when hash is unchanged
    expect(results[0].findingsCount).toBe(0);
  });

  // ── Test 12: runAuthScan throws → scan still completes ───────────────────
  it("runAuthScan throws → scan completes with normal status (auth scan is isolated)", async () => {
    const { runAuthScan } = await import("@/lib/scanner-auth");
    vi.mocked(runAuthScan).mockRejectedValueOnce(new Error("auth scan exploded"));

    // discoverEndpoints returns some endpoints so runAuthScan is actually called
    const { discoverEndpoints } = await import("@/lib/endpoint-discovery");
    vi.mocked(discoverEndpoints).mockResolvedValueOnce([
      { url: "https://example.com/login", method: "POST", type: "login" } as never,
    ]);

    const app = makeApp();
    monitoredAppFindMany.mockResolvedValueOnce([{ id: app.id, orgId: app.orgId, nextCheckAt: null }]);
    monitoredAppFindUnique.mockResolvedValueOnce(app);
    monitorRunCreate.mockResolvedValueOnce({ id: "run_authfail" });

    mockIsPrivateUrl.mockResolvedValue(false);
    mockSsrfSafeFetch.mockResolvedValueOnce(makeOkResponse());

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    const results = await runDueHttpScans();

    // Scan should still complete — auth scan failure is non-fatal
    expect(results).toHaveLength(1);
    expect(results[0].appId).toBe("app_ok");
    expect(["HEALTHY", "WARNING", "CRITICAL"]).toContain(results[0].status);
    // It should NOT have the auth scan error bubbled as the scan error
    expect(results[0].error).toBeUndefined();
  });

  // ── Test 13: limit param → findMany called with correct take ─────────────
  it("limit=2 with 5 due apps → findMany called with take: 2", async () => {
    // Return only 2 apps (as if DB respects limit)
    monitoredAppFindMany.mockResolvedValueOnce([
      { id: "app_1", orgId: "org_a", nextCheckAt: null },
      { id: "app_2", orgId: "org_a", nextCheckAt: null },
    ]);
    monitoredAppFindUnique.mockResolvedValue(null); // all fail

    const { runDueHttpScans } = await import("@/lib/scanner-http");
    await runDueHttpScans(2);

    // findMany should have been called with take: 2
    expect(monitoredAppFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 2 }),
    );
  });
});
