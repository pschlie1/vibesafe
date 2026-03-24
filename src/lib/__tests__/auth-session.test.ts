import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockCookiesGet, mockCookiesSet } = vi.hoisted(() => ({
  mockCookiesGet: vi.fn(),
  mockCookiesSet: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookiesGet,
    set: mockCookiesSet,
  })),
}));

const { mockUserFindUnique } = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: mockUserFindUnique,
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const TEST_SECRET = "test-jwt-secret-for-unit-tests-only";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = TEST_SECRET;
});

// ---------------------------------------------------------------------------
// Import under test — after mocks are wired
// ---------------------------------------------------------------------------

import { getSession, requireSession, requireRole, destroySession, REFRESH_THRESHOLD } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseSession: SessionUser = {
  id: "user_1",
  email: "alice@example.com",
  name: "Alice",
  role: "ADMIN",
  orgId: "org_1",
  orgName: "Acme",
  orgSlug: "acme",
};

const dbUser = {
  id: "user_1",
  email: "alice@example.com",
  name: "Alice",
  role: "ADMIN",
  orgId: "org_1",
  updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  org: { name: "Acme", slug: "acme" },
  lastLoginAt: null,
};

function signFreshToken(overrides: Partial<SessionUser> = {}, iatOffsetSecs = 0): string {
  const payload = { ...baseSession, ...overrides };
  // Sign with explicit iat so we can control age
  const iat = Math.floor(Date.now() / 1000) + iatOffsetSecs;
  return jwt.sign({ ...payload, iat }, TEST_SECRET, {
    algorithm: "HS256",
    expiresIn: 24 * 60 * 60,
    issuer: "scantient",
    audience: "scantient-app",
  });
}

function signOldToken(ageSeconds: number): string {
  // iat in the past by ageSeconds
  const iat = Math.floor(Date.now() / 1000) - ageSeconds;
  const payload = { ...baseSession, iat };
  return jwt.sign(payload, TEST_SECRET, {
    algorithm: "HS256",
    // expiresIn must be large enough that old token is not expired
    expiresIn: 7 * 24 * 60 * 60,
    issuer: "scantient",
    audience: "scantient-app",
    noTimestamp: false,
  });
}

// ---------------------------------------------------------------------------
// getSession — edge cases
// ---------------------------------------------------------------------------

describe("getSession — edge cases", () => {
  it("no cookie: returns null", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const result = await getSession();

    expect(result).toBeNull();
  });

  it("invalid/expired JWT: returns null", async () => {
    mockCookiesGet.mockReturnValue({ value: "this.is.not.valid" });

    const result = await getSession();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getSession — fresh token path
// ---------------------------------------------------------------------------

describe("getSession — fresh token (age < REFRESH_THRESHOLD)", () => {
  it("valid fresh token: returns SessionUser without DB hit", async () => {
    const token = signFreshToken(); // just issued, age ~ 0
    mockCookiesGet.mockReturnValue({ value: token });

    const result = await getSession();

    expect(result).not.toBeNull();
    expect(result?.id).toBe("user_1");
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getSession — token refresh path
// ---------------------------------------------------------------------------

describe("getSession — token refresh path (age > REFRESH_THRESHOLD)", () => {
  it("token older than REFRESH_THRESHOLD: re-fetches user from DB and issues new cookie", async () => {
    const token = signOldToken(REFRESH_THRESHOLD + 60);
    mockCookiesGet.mockReturnValue({ value: token });
    mockUserFindUnique.mockResolvedValue(dbUser);
    mockCookiesSet.mockReturnValue(undefined);

    const result = await getSession();

    expect(result).not.toBeNull();
    expect(result?.id).toBe("user_1");
    expect(mockUserFindUnique).toHaveBeenCalled();
    expect(mockCookiesSet).toHaveBeenCalled();
  });

  it("token old but user.updatedAt is AFTER token iat: returns null (session invalidated)", async () => {
    const tokenAge = REFRESH_THRESHOLD + 60;
    const token = signOldToken(tokenAge);
    mockCookiesGet.mockReturnValue({ value: token });

    // updatedAt is 30s after token was issued (password reset happened after token issued)
    const updatedAt = new Date(Date.now() - (tokenAge - 30) * 1000);
    mockUserFindUnique.mockResolvedValue({ ...dbUser, updatedAt });

    const result = await getSession();

    expect(result).toBeNull();
  });

  it("token old but user not found in DB: returns null", async () => {
    const token = signOldToken(REFRESH_THRESHOLD + 60);
    mockCookiesGet.mockReturnValue({ value: token });
    mockUserFindUnique.mockResolvedValue(null);

    const result = await getSession();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// requireSession
// ---------------------------------------------------------------------------

describe("requireSession", () => {
  it("valid session: returns SessionUser", async () => {
    const token = signFreshToken();
    mockCookiesGet.mockReturnValue({ value: token });

    const result = await requireSession();

    expect(result.id).toBe("user_1");
  });

  it("no session: throws Unauthorized", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    await expect(requireSession()).rejects.toThrow("Unauthorized");
  });
});

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------

describe("requireRole", () => {
  it("user has required role: returns SessionUser", async () => {
    const token = signFreshToken({ role: "ADMIN" });
    mockCookiesGet.mockReturnValue({ value: token });

    const result = await requireRole(["ADMIN"]);

    expect(result.role).toBe("ADMIN");
  });

  it("user lacks required role: throws Forbidden", async () => {
    const token = signFreshToken({ role: "MEMBER" });
    mockCookiesGet.mockReturnValue({ value: token });

    await expect(requireRole(["ADMIN"])).rejects.toThrow("Forbidden");
  });
});

// ---------------------------------------------------------------------------
// destroySession
// ---------------------------------------------------------------------------

describe("destroySession", () => {
  it("sets cookie with maxAge 0 (logout)", async () => {
    mockCookiesSet.mockReturnValue(undefined);

    await destroySession();

    expect(mockCookiesSet).toHaveBeenCalledWith(
      "scantient-session",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
  });
});
