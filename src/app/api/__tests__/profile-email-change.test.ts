/**
 * profile-email-change.test.ts
 * Tests for PATCH /api/auth/me (profile update) and GET /api/auth/confirm-email-change
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

const TEST_JWT_SECRET = "test-jwt-secret-profile";

beforeAll(() => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.NEXT_PUBLIC_URL = "https://scantient.com";
});

// ─── Auth mocks ───────────────────────────────────────────────────────────────
const getSession = vi.fn();
const hashPassword = vi.fn().mockResolvedValue("new_hashed_password");
const verifyPassword = vi.fn();
const destroySession = vi.fn();

vi.mock("@/lib/auth", () => ({ getSession, hashPassword, verifyPassword, destroySession }));

// ─── DB mocks ─────────────────────────────────────────────────────────────────
const userFindUnique = vi.fn();
const userFindFirst = vi.fn();
const userUpdate = vi.fn();
const monitoredAppCount = vi.fn().mockResolvedValue(0);
const userCount = vi.fn().mockResolvedValue(1);
const subscriptionFindUnique = vi.fn().mockResolvedValue(null);

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: userFindUnique, findFirst: userFindFirst, count: userCount, update: userUpdate },
    monitoredApp: { count: monitoredAppCount },
    subscription: { findUnique: subscriptionFindUnique },
  },
}));

// ─── Tenant mock ──────────────────────────────────────────────────────────────
vi.mock("@/lib/tenant", () => ({
  getOrgLimits: vi.fn().mockResolvedValue({ tier: "FREE", maxApps: 1, maxUsers: 1, cancelAtPeriodEnd: false }),
}));

// ─── Rate limit mock ──────────────────────────────────────────────────────────
const checkRateLimit = vi.fn().mockResolvedValue({ allowed: true });
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit,
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

// ─── Fetch spy (Resend) ───────────────────────────────────────────────────────
const fetchSpy = vi.spyOn(globalThis, "fetch");

const validSession = {
  id: "user_1",
  email: "alice@example.com",
  orgId: "org_1",
  name: "Alice",
  role: "OWNER" as const,
  orgName: "Acme",
  orgSlug: "acme",
};

const validUser = {
  id: "user_1",
  email: "alice@example.com",
  name: "Alice",
  passwordHash: "hashed_old",
  emailVerified: true,
  updatedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  checkRateLimit.mockResolvedValue({ allowed: true });
  getSession.mockResolvedValue(validSession);
  hashPassword.mockResolvedValue("new_hashed_password");
  verifyPassword.mockResolvedValue(true);
  fetchSpy.mockResolvedValue(new Response("{}", { status: 200 }));
  userFindUnique.mockResolvedValue(validUser);
  userFindFirst.mockResolvedValue(null);
  userUpdate.mockResolvedValue({ ...validUser, name: "Updated" });
  monitoredAppCount.mockResolvedValue(0);
  userCount.mockResolvedValue(1);
  subscriptionFindUnique.mockResolvedValue(null);
});

function patchReq(body: unknown) {
  return new Request("http://localhost/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────

describe("PATCH /api/auth/me", () => {
  it("returns 401 when unauthenticated", async () => {
    getSession.mockResolvedValueOnce(null);
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ name: "Bob" }));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    checkRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 });
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ name: "Bob" }));
    expect(res.status).toBe(429);
  });

  it("returns 400 when no fields provided", async () => {
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({}));
    expect(res.status).toBe(400);
  });

  it("updates name without password verification", async () => {
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ name: "Bob Smith" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "Bob Smith" }) }),
    );
  });

  it("returns 400 when changing password without currentPassword", async () => {
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ newPassword: "NewSecurePass1!" }));
    expect(res.status).toBe(400);
  });

  it("updates password when currentPassword is correct", async () => {
    verifyPassword.mockResolvedValueOnce(true);
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ currentPassword: "OldPass1!", newPassword: "NewSecurePass1!" }));
    expect(res.status).toBe(200);
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: "new_hashed_password" }),
      }),
    );
  });

  it("returns 401 when currentPassword is wrong (password change)", async () => {
    verifyPassword.mockResolvedValueOnce(false);
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ currentPassword: "WrongPass!", newPassword: "NewSecurePass1!" }));
    expect(res.status).toBe(401);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when changing email without currentPassword", async () => {
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ email: "new@example.com" }));
    expect(res.status).toBe(400);
  });

  it("sends verification email to new address and returns emailChangePending=true", async () => {
    process.env.RESEND_API_KEY = "re_test";
    verifyPassword.mockResolvedValueOnce(true);
    userFindFirst.mockResolvedValueOnce(null); // no conflict
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ email: "new@example.com", currentPassword: "OldPass1!" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.emailChangePending).toBe(true);
    // Email sent to the NEW address
    const fetchCall = fetchSpy.mock.calls.find((c) => String(c[0]).includes("resend.com"));
    expect(fetchCall).toBeDefined();
    const body = JSON.parse(fetchCall![1]!.body as string);
    expect(body.to).toContain("new@example.com");
    delete process.env.RESEND_API_KEY;
  });

  it("returns 409 when new email is already taken", async () => {
    verifyPassword.mockResolvedValueOnce(true);
    userFindFirst.mockResolvedValueOnce({ id: "other_user", email: "taken@example.com" });
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ email: "taken@example.com", currentPassword: "OldPass1!" }));
    expect(res.status).toBe(409);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("returns 200 with no email change when new email equals current email", async () => {
    verifyPassword.mockResolvedValueOnce(true);
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ email: "alice@example.com", currentPassword: "OldPass1!" }));
    // Same email — treated as no fields changed, returns 200 ok with no DB write or email
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 for SSO account attempting password change", async () => {
    userFindUnique.mockResolvedValueOnce({ ...validUser, passwordHash: null });
    const { PATCH } = await import("@/app/api/auth/me/route");
    const res = await PATCH(patchReq({ currentPassword: "OldPass1!", newPassword: "NewSecurePass1!" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    // errorResponse wraps in { error: { message } } or { message } depending on impl
    const text = JSON.stringify(json);
    expect(text.toLowerCase()).toContain("sso");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/confirm-email-change
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/auth/confirm-email-change", () => {
  function makeToken(payload: object, expiresIn: string | number = "24h") {
    return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: expiresIn as import("jsonwebtoken").SignOptions["expiresIn"] });
  }

  it("returns 400 when token is missing", async () => {
    const { GET } = await import("@/app/api/auth/confirm-email-change/route");
    const res = await GET(new Request("http://localhost/api/auth/confirm-email-change"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid/expired token", async () => {
    const { GET } = await import("@/app/api/auth/confirm-email-change/route");
    const res = await GET(new Request("http://localhost/api/auth/confirm-email-change?token=bad_token"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when token has wrong purpose", async () => {
    const token = makeToken({ sub: "user_1", purpose: "password-reset", newEmail: "new@example.com" });
    const { GET } = await import("@/app/api/auth/confirm-email-change/route");
    const res = await GET(new Request(`http://localhost/api/auth/confirm-email-change?token=${token}`));
    expect(res.status).toBe(400);
  });

  it("returns 404 when user not found", async () => {
    userFindUnique.mockResolvedValueOnce(null);
    const token = makeToken({ sub: "ghost", purpose: "email-change", newEmail: "new@example.com" });
    const { GET } = await import("@/app/api/auth/confirm-email-change/route");
    const res = await GET(new Request(`http://localhost/api/auth/confirm-email-change?token=${token}`));
    expect(res.status).toBe(404);
  });

  it("returns 400 when token already used (updatedAt > iat)", async () => {
    const token = makeToken({ sub: "user_1", purpose: "email-change", newEmail: "new@example.com" });
    // updatedAt is after the token was issued
    userFindUnique.mockResolvedValueOnce({ ...validUser, updatedAt: new Date(Date.now() + 10_000) });
    const { GET } = await import("@/app/api/auth/confirm-email-change/route");
    const res = await GET(new Request(`http://localhost/api/auth/confirm-email-change?token=${token}`));
    expect(res.status).toBe(400);
  });

  it("returns 409 when new email claimed by another user in the meantime", async () => {
    userFindUnique.mockResolvedValueOnce({ ...validUser, updatedAt: new Date("2025-01-01") });
    userFindFirst.mockResolvedValueOnce({ id: "other_user", email: "new@example.com" });
    const token = makeToken({ sub: "user_1", purpose: "email-change", newEmail: "new@example.com" });
    const { GET } = await import("@/app/api/auth/confirm-email-change/route");
    const res = await GET(new Request(`http://localhost/api/auth/confirm-email-change?token=${token}`));
    expect(res.status).toBe(409);
  });

  it("updates email and redirects on valid token", async () => {
    userFindUnique.mockResolvedValueOnce({ ...validUser, updatedAt: new Date("2025-01-01") });
    userFindFirst.mockResolvedValueOnce(null); // no conflict
    userUpdate.mockResolvedValueOnce({ ...validUser, email: "new@example.com" });
    const token = makeToken({ sub: "user_1", purpose: "email-change", newEmail: "new@example.com" });
    const { GET } = await import("@/app/api/auth/confirm-email-change/route");
    const res = await GET(new Request(`http://localhost/api/auth/confirm-email-change?token=${token}`));
    // Redirects to settings page
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("email_changed=true");
    // Email and updatedAt bumped (invalidates sessions)
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "new@example.com" }),
      }),
    );
  });
});
