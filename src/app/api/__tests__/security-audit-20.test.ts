/**
 * security-audit-20.test.ts
 *
 * Tests for Audit-20 security fixes:
 *  1. Reserved org slug blocklist — "api"/"admin"/etc. get a random suffix
 *  2. Password complexity — min 12 + uppercase + lowercase + digit + special char
 *  3. Cache-Control exemption — /api/public/ routes excluded from no-store
 *  4. Audit log completeness — logAudit called on key create/delete + org creation
 *  5. Input length limits — orgName max 64, name max 100
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── DB mocks ─────────────────────────────────────────────────────────────────
const userFindFirst = vi.fn();
const userFindUnique = vi.fn();
const orgCreate = vi.fn();
const apiKeyCreate = vi.fn();
const apiKeyFindFirst = vi.fn();
const apiKeyDelete = vi.fn();
const apiKeyCount = vi.fn();
const apiKeyFindMany = vi.fn();
const inviteFindUnique = vi.fn();
const inviteDelete = vi.fn();
const dbTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: { findFirst: userFindFirst, findUnique: userFindUnique },
    organization: { create: orgCreate },
    apiKey: {
      create: apiKeyCreate,
      findFirst: apiKeyFindFirst,
      delete: apiKeyDelete,
      count: apiKeyCount,
      findMany: apiKeyFindMany,
    },
    invite: { findUnique: inviteFindUnique, delete: inviteDelete },
    $transaction: dbTransaction,
  },
}));

// ─── Auth mocks ───────────────────────────────────────────────────────────────
const hashPassword = vi.fn().mockResolvedValue("hashed-pw");
const createSession = vi.fn();
const getSession = vi.fn();

vi.mock("@/lib/auth", () => ({ hashPassword, createSession, getSession }));

// ─── Rate limit mocks ─────────────────────────────────────────────────────────
const checkRateLimit = vi.fn();
const getClientIp = vi.fn().mockReturnValue("1.2.3.4");

vi.mock("@/lib/rate-limit", () => ({ checkRateLimit, getClientIp }));

// ─── Analytics mock ───────────────────────────────────────────────────────────
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn().mockResolvedValue(undefined) }));

// ─── Tenant mocks ─────────────────────────────────────────────────────────────
const logAudit = vi.fn();
const canAddUser = vi.fn();
const getOrgLimits = vi.fn();

vi.mock("@/lib/tenant", () => ({ logAudit, canAddUser, getOrgLimits }));

// ─── Onboarding mock ──────────────────────────────────────────────────────────
vi.mock("@/lib/onboarding", () => ({ extractSuggestedDomain: vi.fn().mockReturnValue("example.com") }));

// ─── next/headers mock ────────────────────────────────────────────────────────
const cookiesGet = vi.fn();
const cookiesSet = vi.fn();
const cookiesDelete = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: cookiesGet, set: cookiesSet, delete: cookiesDelete }),
}));

// ─── Global fetch stub (suppress email calls) ─────────────────────────────────
vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));

// ─── Shared session stub ──────────────────────────────────────────────────────
const SESSION_STUB = {
  id: "u1",
  email: "owner@example.com",
  name: "Owner",
  role: "OWNER" as const,
  orgId: "org-1",
  orgName: "TestOrg",
  orgSlug: "testorg",
};

beforeAll(() => {
  process.env.JWT_SECRET = "test-jwt-secret-audit-20";
  process.env.RESEND_API_KEY = undefined as unknown as string;
});

beforeEach(() => {
  vi.clearAllMocks();
  // Restore sensible defaults
  hashPassword.mockResolvedValue("hashed-pw");
  createSession.mockResolvedValue(SESSION_STUB);
  getSession.mockResolvedValue(SESSION_STUB);
  checkRateLimit.mockResolvedValue({ allowed: true });
  getClientIp.mockReturnValue("1.2.3.4");
  logAudit.mockResolvedValue(undefined);
  canAddUser.mockResolvedValue({ allowed: true });
  getOrgLimits.mockResolvedValue({ tier: "PRO" });
  cookiesGet.mockReturnValue(undefined);
  cookiesSet.mockResolvedValue(undefined);
  cookiesDelete.mockResolvedValue(undefined);
});

function makeReq(body: unknown, method = "POST") {
  return new Request("http://localhost", {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
  });
}

// =============================================================================
// 1. Reserved Org Slug Blocklist — unit tests on isReservedSlug + passwordSchema
// =============================================================================
describe("A20-1: isReservedSlug (unit)", () => {
  it("is exported from @/lib/validation", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(typeof isReservedSlug).toBe("function");
  });

  it("returns true for 'api'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("api")).toBe(true);
  });

  it("returns true for 'admin'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("admin")).toBe(true);
  });

  it("returns true for 'www'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("www")).toBe(true);
  });

  it("returns true for 'dashboard'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("dashboard")).toBe(true);
  });

  it("returns true for 'login'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("login")).toBe(true);
  });

  it("returns true for 'cdn'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("cdn")).toBe(true);
  });

  it("returns false for 'legit-company'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("legit-company")).toBe(false);
  });

  it("returns false for 'my-org'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("my-org")).toBe(false);
  });

  it("returns false for 'acme'", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("acme")).toBe(false);
  });

  it("is case-insensitive (API → reserved)", async () => {
    const { isReservedSlug } = await import("@/lib/validation");
    expect(isReservedSlug("API")).toBe(true);
  });
});

describe("A20-1: RESERVED_SLUGS set (unit)", () => {
  it("RESERVED_SLUGS contains all required entries", async () => {
    const { RESERVED_SLUGS } = await import("@/lib/validation");
    const required = [
      "api", "v1", "admin", "www", "app", "static", "public", "auth",
      "dashboard", "settings", "billing", "login", "logout", "signup",
      "health", "status", "docs", "blog", "support", "help",
      "mail", "email", "smtp", "ftp", "cdn", "assets", "images",
      "uploads", "download", "downloads", "files", "media",
    ];
    for (const slug of required) {
      expect(RESERVED_SLUGS.has(slug), `Expected '${slug}' in RESERVED_SLUGS`).toBe(true);
    }
  });
});

describe("A20-1: Signup route — reserved slug handling (source inspection)", () => {
  it("signup/route.ts imports isReservedSlug from @/lib/validation", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    expect(src).toContain("isReservedSlug");
    expect(src).toContain("@/lib/validation");
  });

  it("signup/route.ts calls isReservedSlug on the computed slug", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    expect(src).toContain("isReservedSlug(slug)");
  });

  it("signup/route.ts appends a random suffix when slug is reserved", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    // Should contain logic to append suffix (e.g. slugSuffix or some crypto-based suffix)
    expect(src).toMatch(/slugSuffix|randomSuffix|nanoid|random/);
    expect(src).toContain("isReservedSlug(slug)");
  });
});

describe("A20-1: Signup route — reserved slug behavioral test", () => {
  function makeSignupOrg(org: object) {
    return {
      id: "org-1",
      name: "test",
      slug: "test",
      users: [{ id: "u1", email: "test@example.com", name: "Test User" }],
      ...org,
    };
  }

  const VALID_PASSWORD = "SecurePass123!";

  it("org named 'api' stores a slug that is NOT exactly 'api' (gets suffix)", async () => {
    userFindFirst.mockResolvedValueOnce(null); // no existing user
    let capturedSlug = "";
    orgCreate.mockImplementationOnce(({ data }: { data: { slug: string; name: string } }) => {
      capturedSlug = data.slug;
      return Promise.resolve(makeSignupOrg({ name: data.name, slug: data.slug }));
    });

    const { POST } = await import("@/app/api/auth/signup/route");
    await POST(makeReq({ email: "a@b.com", password: VALID_PASSWORD, name: "Ali", orgName: "api" }));

    // The slug should start with "api-" and contain extra characters beyond just the timestamp
    expect(capturedSlug).toMatch(/^api-/);
    // It should NOT be exactly "api" (no suffix at all before timestamp)
    // The pattern after reserved check: "api-<suffix4chars>-<timestamp>"
    const withoutTimestamp = capturedSlug.replace(/-[a-z0-9]+$/, "");
    expect(withoutTimestamp).not.toBe("api");
  });

  it("org named 'admin' stores a slug that is NOT exactly 'admin' (gets suffix)", async () => {
    userFindFirst.mockResolvedValueOnce(null);
    let capturedSlug = "";
    orgCreate.mockImplementationOnce(({ data }: { data: { slug: string; name: string } }) => {
      capturedSlug = data.slug;
      return Promise.resolve(makeSignupOrg({ name: data.name, slug: data.slug }));
    });

    const { POST } = await import("@/app/api/auth/signup/route");
    await POST(makeReq({ email: "a@b.com", password: VALID_PASSWORD, name: "Ali", orgName: "admin" }));

    expect(capturedSlug).toMatch(/^admin-/);
    const withoutTimestamp = capturedSlug.replace(/-[a-z0-9]+$/, "");
    expect(withoutTimestamp).not.toBe("admin");
  });

  it("org named 'Legit Company' stores a slug starting with 'legit-company' (no extra suffix)", async () => {
    userFindFirst.mockResolvedValueOnce(null);
    let capturedSlug = "";
    orgCreate.mockImplementationOnce(({ data }: { data: { slug: string; name: string } }) => {
      capturedSlug = data.slug;
      return Promise.resolve(makeSignupOrg({ name: data.name, slug: data.slug }));
    });

    const { POST } = await import("@/app/api/auth/signup/route");
    await POST(makeReq({ email: "a@b.com", password: VALID_PASSWORD, name: "Ali", orgName: "Legit Company" }));

    // Should start with "legit-company-" (the timestamp suffix only, no extra random suffix)
    expect(capturedSlug).toMatch(/^legit-company-/);
    // The part without the final timestamp should just be "legit-company"
    const withoutTimestamp = capturedSlug.replace(/-[a-z0-9]+$/, "");
    expect(withoutTimestamp).toBe("legit-company");
  });
});

// =============================================================================
// 2. Password Complexity — passwordSchema unit tests
// =============================================================================
describe("A20-2: passwordSchema (unit)", () => {
  it("is exported from @/lib/validation", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    expect(passwordSchema).toBeDefined();
  });

  it("accepts a strong password", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    expect(passwordSchema.safeParse("SecurePass123!").success).toBe(true);
  });

  it("rejects password shorter than 12 characters", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    const result = passwordSchema.safeParse("Short1!");
    expect(result.success).toBe(false);
  });

  it("rejects password with no uppercase letter", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    const result = passwordSchema.safeParse("alllowercase123!");
    expect(result.success).toBe(false);
  });

  it("rejects password with no lowercase letter", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    const result = passwordSchema.safeParse("ALLUPPERCASE123!");
    expect(result.success).toBe(false);
  });

  it("rejects password with no digit", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    const result = passwordSchema.safeParse("NoDigitsHere!!!");
    expect(result.success).toBe(false);
  });

  it("rejects password with no special character", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    const result = passwordSchema.safeParse("NoSpecialChar1234");
    expect(result.success).toBe(false);
  });

  it("includes a meaningful error message for short passwords", async () => {
    const { passwordSchema } = await import("@/lib/validation");
    const result = passwordSchema.safeParse("Sh1!");
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.message);
      expect(msgs.some((m) => m.toLowerCase().includes("12"))).toBe(true);
    }
  });
});

// ─── Signup route: password complexity ────────────────────────────────────────
describe("A20-2: Signup route — password complexity enforcement", () => {
  it("returns 400 for password with no uppercase letter", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({ email: "a@b.com", password: "alllowercase123!", name: "Ali", orgName: "Acme" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for password with no digit", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({ email: "a@b.com", password: "NoDigitsHere!!!", name: "Ali", orgName: "Acme" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for password with no special character", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({ email: "a@b.com", password: "NoSpecialChar1234", name: "Ali", orgName: "Acme" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for short password", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({ email: "a@b.com", password: "Short1!", name: "Ali", orgName: "Acme" }),
    );
    expect(res.status).toBe(400);
  });

  it("signup/route.ts uses passwordSchema for the password field", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    expect(src).toContain("passwordSchema");
  });
});

// ─── Reset-password route: password complexity ────────────────────────────────
describe("A20-2: Reset-password route — password complexity enforcement", () => {
  it("returns 400 for password with no uppercase letter", async () => {
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(makeReq({ token: "sometoken", password: "alllowercase123!" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for password with no digit", async () => {
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(makeReq({ token: "sometoken", password: "NoDigitsHere!!!" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for password with no special character", async () => {
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(makeReq({ token: "sometoken", password: "NoSpecialChar1234" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for short password", async () => {
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(makeReq({ token: "sometoken", password: "Short1!" }));
    expect(res.status).toBe(400);
  });

  it("reset-password/route.ts uses passwordSchema", () => {
    const src = readFileSync(resolve(__dir, "../auth/reset-password/route.ts"), "utf8");
    expect(src).toContain("passwordSchema");
    // Must NOT have the old bare .min(12) pattern for password
    expect(src).not.toMatch(/password:\s*z\.string\(\)\.min\(12/);
  });
});

// ─── Invite route: password complexity ────────────────────────────────────────
describe("A20-2: Invite route — password complexity enforcement", () => {
  function validInvite() {
    return {
      token: "tok",
      email: "invited@example.com",
      role: "MEMBER",
      orgId: "org-1",
      expiresAt: new Date(Date.now() + 86_400_000),
      org: { id: "org-1", name: "TestOrg" },
    };
  }

  it("returns 400 for password with no uppercase letter", async () => {
    inviteFindUnique.mockResolvedValueOnce(validInvite());
    const { POST } = await import("@/app/api/auth/invite/[token]/route");
    const res = await POST(
      makeReq({ name: "Alice", password: "alllowercase123!" }),
      { params: Promise.resolve({ token: "tok" }) },
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for password with no digit", async () => {
    inviteFindUnique.mockResolvedValueOnce(validInvite());
    const { POST } = await import("@/app/api/auth/invite/[token]/route");
    const res = await POST(
      makeReq({ name: "Alice", password: "NoDigitsHere!!!" }),
      { params: Promise.resolve({ token: "tok" }) },
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for password with no special character", async () => {
    inviteFindUnique.mockResolvedValueOnce(validInvite());
    const { POST } = await import("@/app/api/auth/invite/[token]/route");
    const res = await POST(
      makeReq({ name: "Alice", password: "NoSpecialChar1234" }),
      { params: Promise.resolve({ token: "tok" }) },
    );
    expect(res.status).toBe(400);
  });

  it("invite/[token]/route.ts uses passwordSchema", () => {
    const src = readFileSync(resolve(__dir, "../auth/invite/[token]/route.ts"), "utf8");
    expect(src).toContain("passwordSchema");
    expect(src).not.toMatch(/password:\s*z\.string\(\)\.min\(12/);
  });
});

// =============================================================================
// 3. Cache-Control Exemption for /api/public/ routes
// =============================================================================
describe("A20-3: Cache-Control exemption for /api/public/ routes (source inspection)", () => {
  it("middleware.ts defines isPublicApiRoute", () => {
    const src = readFileSync(resolve(__dir, "../../../middleware.ts"), "utf8");
    expect(src).toContain("isPublicApiRoute");
  });

  it("middleware.ts checks pathname.startsWith('/api/public/') for isPublicApiRoute", () => {
    const src = readFileSync(resolve(__dir, "../../../middleware.ts"), "utf8");
    expect(src).toContain('"/api/public/"');
    expect(src).toContain("isPublicApiRoute");
  });

  it("middleware.ts excludes public API routes from no-store (isApiRoute && !isPublicApiRoute pattern)", () => {
    const src = readFileSync(resolve(__dir, "../../../middleware.ts"), "utf8");
    expect(src).toContain("!isPublicApiRoute");
    // Verify the negation is used in the condition passed to applySecurityHeaders or equivalent
    expect(src).toMatch(/isApiRoute\s*&&\s*!isPublicApiRoute/);
  });

  it("middleware.ts still sets no-store for regular API routes (no exemption removed from non-public)", () => {
    const src = readFileSync(resolve(__dir, "../../../middleware.ts"), "utf8");
    expect(src).toContain("no-store");
    // Cache-Control block should still exist for isApiRoute
    expect(src).toContain("Cache-Control");
    expect(src).toContain("private");
  });

  it("middleware.ts still sets Pragma: no-cache", () => {
    const src = readFileSync(resolve(__dir, "../../../middleware.ts"), "utf8");
    expect(src).toContain("Pragma");
    expect(src).toContain("no-cache");
  });
});

// =============================================================================
// 4. Audit Log Completeness
// =============================================================================
describe("A20-4: Audit log — keys/route.ts (source inspection)", () => {
  it("keys/route.ts imports logAudit", () => {
    const src = readFileSync(resolve(__dir, "../keys/route.ts"), "utf8");
    expect(src).toContain("logAudit");
  });

  it("keys/route.ts calls logAudit after API key creation", () => {
    const src = readFileSync(resolve(__dir, "../keys/route.ts"), "utf8");
    expect(src).toContain("api_key.created");
    expect(src).toMatch(/await logAudit\(session,\s*["']api_key\.created["']/);
  });
});

describe("A20-4: Audit log — keys/[id]/route.ts (source inspection)", () => {
  it("keys/[id]/route.ts imports logAudit", () => {
    const src = readFileSync(resolve(__dir, "../keys/[id]/route.ts"), "utf8");
    expect(src).toContain("logAudit");
  });

  it("keys/[id]/route.ts calls logAudit after API key deletion", () => {
    const src = readFileSync(resolve(__dir, "../keys/[id]/route.ts"), "utf8");
    // Action may be "api_key.revoked" or "key.deleted" — check one is present
    expect(src).toMatch(/api_key\.(revoked|deleted)|key\.(deleted|revoked)/);
    expect(src).toMatch(/await logAudit\(/);
  });
});

describe("A20-4: Audit log — signup/route.ts org.created (source inspection)", () => {
  it("signup/route.ts imports logAudit", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    expect(src).toContain("logAudit");
    expect(src).toContain("@/lib/tenant");
  });

  it("signup/route.ts calls logAudit with 'org.created'", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    expect(src).toContain("org.created");
    expect(src).toMatch(/logAudit\(session,\s*["']org\.created["']/);
  });
});

describe("A20-4: Audit log — signup behavioral", () => {
  it("logAudit is called with org.created after successful signup", async () => {
    userFindFirst.mockResolvedValueOnce(null);
    orgCreate.mockResolvedValueOnce({
      id: "org-1",
      name: "Acme",
      slug: "acme-abc",
      users: [{ id: "u1", email: "owner@acme.com", name: "Owner" }],
    });

    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({ email: "owner@acme.com", password: "SecurePass123!", name: "Owner", orgName: "Acme" }),
    );

    expect(res.status).toBe(201);
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ id: SESSION_STUB.id }),
      "org.created",
      "org-1",
      expect.any(String),
    );
  });
});

// =============================================================================
// 5. Input Length Limits
// =============================================================================
describe("A20-5: Input length limits — signup route", () => {
  it("returns 400 when orgName exceeds 64 characters", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({
        email: "a@b.com",
        password: "SecurePass123!",
        name: "Owner",
        orgName: "A".repeat(65),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("accepts orgName of exactly 64 characters", async () => {
    userFindFirst.mockResolvedValueOnce(null);
    orgCreate.mockResolvedValueOnce({
      id: "org-1",
      name: "A".repeat(64),
      slug: "aaa-abc",
      users: [{ id: "u1", email: "a@b.com", name: "Owner" }],
    });
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({
        email: "a@b.com",
        password: "SecurePass123!",
        name: "Owner",
        orgName: "A".repeat(64),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("returns 400 when name exceeds 100 characters", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({
        email: "a@b.com",
        password: "SecurePass123!",
        name: "A".repeat(101),
        orgName: "Acme",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("accepts name of exactly 100 characters", async () => {
    userFindFirst.mockResolvedValueOnce(null);
    orgCreate.mockResolvedValueOnce({
      id: "org-1",
      name: "Acme",
      slug: "acme-abc",
      users: [{ id: "u1", email: "a@b.com", name: "A".repeat(100) }],
    });
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(
      makeReq({
        email: "a@b.com",
        password: "SecurePass123!",
        name: "A".repeat(100),
        orgName: "Acme",
      }),
    );
    expect(res.status).toBe(201);
  });

  it("signup/route.ts schema includes max(64) for orgName", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    expect(src).toContain("max(64)");
  });

  it("signup/route.ts schema includes max(100) for name", () => {
    const src = readFileSync(resolve(__dir, "../auth/signup/route.ts"), "utf8");
    expect(src).toContain("max(100)");
  });
});

describe("A20-5: Input length limits — invite acceptance route", () => {
  function validInvite() {
    return {
      token: "tok",
      email: "invited@example.com",
      role: "MEMBER",
      orgId: "org-1",
      expiresAt: new Date(Date.now() + 86_400_000),
      org: { id: "org-1", name: "TestOrg" },
    };
  }

  it("returns 400 when name exceeds 100 characters in invite acceptance", async () => {
    inviteFindUnique.mockResolvedValueOnce(validInvite());
    const { POST } = await import("@/app/api/auth/invite/[token]/route");
    const res = await POST(
      makeReq({ name: "A".repeat(101), password: "SecurePass123!" }),
      { params: Promise.resolve({ token: "tok" }) },
    );
    expect(res.status).toBe(400);
  });

  it("invite/[token]/route.ts schema includes max(100) for name", () => {
    const src = readFileSync(resolve(__dir, "../auth/invite/[token]/route.ts"), "utf8");
    expect(src).toContain("max(100)");
  });
});
