/**
 * sso-domain-enforcement.test.ts
 *
 * Security tests for SSO callback domain enforcement.
 * Verifies that the OIDC email domain is validated against the configured SSO domain,
 * preventing cross-domain authentication (e.g. attacker@evil.com authenticating to company.com).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Cookie mocks ---
const cookieGet = vi.fn();
const cookieSet = vi.fn();
const cookieDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: cookieGet,
    set: cookieSet,
    delete: cookieDelete,
  }),
}));

// --- JWT mock ---
const jwtVerify = vi.fn();
vi.mock("jsonwebtoken", () => ({
  default: { verify: jwtVerify, sign: vi.fn().mockReturnValue("test_state_token") },
  verify: jwtVerify,
  sign: vi.fn().mockReturnValue("test_state_token"),
}));

// --- DB mocks ---
const sSOConfigFindFirst = vi.fn();
const userFindFirst = vi.fn();
const userCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    sSOConfig: { findFirst: sSOConfigFindFirst },
    user: { findFirst: userFindFirst, create: userCreate },
  },
}));

// --- Auth mock ---
const createSession = vi.fn().mockResolvedValue({ id: "u1", email: "user@company.com" });
vi.mock("@/lib/auth", () => ({ createSession }));

// --- Tenant mock ---
vi.mock("@/lib/tenant", () => ({
  canAddUser: vi.fn().mockResolvedValue({ allowed: true }),
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

// --- Rate limit mock ---
const checkRateLimit = vi.fn().mockResolvedValue({ allowed: true });
const getClientIp = vi.fn().mockReturnValue("1.2.3.4");
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit, getClientIp }));

// --- openid-client mock ---
const mockAuthorizationCodeGrant = vi.fn();
vi.mock("openid-client", () => ({
  discovery: vi.fn().mockResolvedValue({}),
  authorizationCodeGrant: mockAuthorizationCodeGrant,
  randomPKCECodeVerifier: vi.fn().mockReturnValue("verifier"),
  calculatePKCECodeChallenge: vi.fn().mockResolvedValue("challenge"),
  randomState: vi.fn().mockReturnValue("state_abc"),
  buildAuthorizationUrl: vi.fn().mockReturnValue({ href: "https://idp.company.com/auth" }),
}));

// --- crypto-util mock ---
vi.mock("@/lib/crypto-util", () => ({
  decrypt: vi.fn().mockReturnValue("client_secret"),
  encrypt: vi.fn().mockReturnValue("encrypted_secret"),
}));

const JWT_SECRET = "test-jwt-secret-sso";

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env.JWT_SECRET = JWT_SECRET;
  checkRateLimit.mockResolvedValue({ allowed: true });
  getClientIp.mockReturnValue("1.2.3.4");
});

function makeCallbackReq(params: Record<string, string> = {}) {
  const url = new URL("https://scantient.com/api/auth/sso/callback");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.href, { method: "GET" });
}

describe("SSO callback — domain enforcement", () => {
  const validStatePayload = {
    codeVerifier: "verifier",
    state: "state_abc",
    orgId: "org_company",
    domain: "company.com",
  };

  const ssoConfig = {
    orgId: "org_company",
    domain: "company.com",
    discoveryUrl: "https://idp.company.com/.well-known/openid-configuration",
    clientId: "client_id",
    clientSecret: "encrypted_secret",
    enabled: true,
  };

  beforeEach(() => {
    // Valid state cookie by default
    jwtVerify.mockReturnValue(validStatePayload);
    cookieGet.mockReturnValue({ value: "state_token" });
    sSOConfigFindFirst.mockResolvedValue(ssoConfig);
  });

  it("allows login when email domain matches configured SSO domain", async () => {
    mockAuthorizationCodeGrant.mockResolvedValue({
      claims: () => ({ email: "alice@company.com", name: "Alice" }),
    });
    userFindFirst.mockResolvedValue({ id: "u1", email: "alice@company.com", orgId: "org_company" });

    const { GET } = await import("@/app/api/auth/sso/callback/route");
    const res = await GET(makeCallbackReq({ code: "auth_code", state: "state_abc" }));

    // Should redirect to dashboard on success
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("rejects login when email domain does NOT match configured SSO domain", async () => {
    // OIDC provider returned a token for attacker@evil.com — should be rejected
    mockAuthorizationCodeGrant.mockResolvedValue({
      claims: () => ({ email: "attacker@evil.com", name: "Attacker" }),
    });

    const { GET } = await import("@/app/api/auth/sso/callback/route");
    const res = await GET(makeCallbackReq({ code: "auth_code", state: "state_abc" }));

    // Should redirect to error page, NOT dashboard
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("sso_domain_mismatch");
    // Should NOT create a user or session
    expect(userCreate).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  it("rejects login when email domain is a subdomain of the allowed domain", async () => {
    // evil.company.com should NOT match company.com (strict equality check)
    mockAuthorizationCodeGrant.mockResolvedValue({
      claims: () => ({ email: "attacker@evil.company.com", name: "Subdomain Attacker" }),
    });

    const { GET } = await import("@/app/api/auth/sso/callback/route");
    const res = await GET(makeCallbackReq({ code: "auth_code", state: "state_abc" }));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("sso_domain_mismatch");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("rejects when state cookie is missing", async () => {
    cookieGet.mockReturnValue(undefined);

    const { GET } = await import("@/app/api/auth/sso/callback/route");
    const res = await GET(makeCallbackReq());

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("sso_failed");
  });

  it("rejects when state JWT is invalid/expired", async () => {
    jwtVerify.mockImplementation(() => { throw new Error("jwt expired"); });

    const { GET } = await import("@/app/api/auth/sso/callback/route");
    const res = await GET(makeCallbackReq());

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("sso_failed");
  });

  it("redirects to user_limit_reached when org is at user capacity", async () => {
    mockAuthorizationCodeGrant.mockResolvedValue({
      claims: () => ({ email: "newuser@company.com", name: "New User" }),
    });
    // New user — not found in DB
    userFindFirst.mockResolvedValue(null);

    const { canAddUser } = await import("@/lib/tenant");
    (canAddUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ allowed: false });

    const { GET } = await import("@/app/api/auth/sso/callback/route");
    const res = await GET(makeCallbackReq({ code: "auth_code", state: "state_abc" }));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("user_limit_reached");
    expect(userCreate).not.toHaveBeenCalled();
  });
});
