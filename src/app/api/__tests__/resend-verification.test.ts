/**
 * resend-verification.test.ts
 * Tests for POST /api/auth/resend-verification
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_JWT_SECRET = "test-jwt-secret-resend-verify";

beforeAll(() => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.NEXT_PUBLIC_URL = "https://scantient.com";
});

// --- DB mocks ---
const userFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: { findFirst: userFindFirst },
  },
}));

// --- Rate limit mocks ---
const checkRateLimit = vi.fn();
const getClientIp = vi.fn().mockReturnValue("1.2.3.4");

vi.mock("@/lib/rate-limit", () => ({ checkRateLimit, getClientIp }));

// --- Fetch mock (Resend API) ---
const fetchSpy = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  vi.resetAllMocks();
  checkRateLimit.mockResolvedValue({ allowed: true });
  getClientIp.mockReturnValue("1.2.3.4");
  fetchSpy.mockResolvedValue(new Response("{}", { status: 200 }));
});

function makeReq(body: unknown) {
  return new Request("http://localhost/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/resend-verification", () => {
  it("returns 200 when email does not exist (no enumeration)", async () => {
    userFindFirst.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(makeReq({ email: "ghost@example.com" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    // Should NOT send email
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 200 when user is already verified (no email sent)", async () => {
    userFindFirst.mockResolvedValueOnce({ id: "u1", email: "verified@example.com", emailVerified: true });
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(makeReq({ email: "verified@example.com" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    // Already verified — should NOT send email
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 200 and sends email when user exists and is unverified", async () => {
    userFindFirst.mockResolvedValueOnce({ id: "u2", email: "unverified@example.com", emailVerified: false });
    process.env.RESEND_API_KEY = "re_test_key";
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(makeReq({ email: "unverified@example.com" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    // Should have called Resend API
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" }),
    );
    delete process.env.RESEND_API_KEY;
  });

  it("returns 200 without sending email when RESEND_API_KEY is not set", async () => {
    userFindFirst.mockResolvedValueOnce({ id: "u3", email: "unverified2@example.com", emailVerified: false });
    delete process.env.RESEND_API_KEY;
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(makeReq({ email: "unverified2@example.com" }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 200 silently when IP rate-limited (no enumeration)", async () => {
    checkRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 3600 });
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(makeReq({ email: "any@example.com" }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 200 when email rate-limited (no enumeration)", async () => {
    // First call (IP check) passes, second call (email check) denies
    checkRateLimit
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: false });
    userFindFirst.mockResolvedValueOnce({ id: "u4", email: "spammed@example.com", emailVerified: false });
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(makeReq({ email: "spammed@example.com" }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 200 for invalid email (no validation error exposed)", async () => {
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(makeReq({ email: "not-an-email" }));
    expect(res.status).toBe(200);
  });

  it("returns 200 for malformed body", async () => {
    const { POST } = await import("@/app/api/auth/resend-verification/route");
    const res = await POST(new Request("http://localhost/api/auth/resend-verification", {
      method: "POST",
      body: "not json",
      headers: { "content-type": "application/json" },
    }));
    expect(res.status).toBe(200);
  });
});
