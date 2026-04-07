import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import * as client from "openid-client";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/api-response";

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (!s && isBuildPhase) return "build-phase-placeholder-secret";
  if (!s) throw new Error("JWT_SECRET environment variable is required");
  return s;
}
const CALLBACK_URL = "https://scantient.com/api/auth/sso/callback";

const STATE_COOKIE = "scantient_sso_state";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`sso-init:${ip}`, { maxAttempts: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain")?.toLowerCase();
  if (!domain) return errorResponse("BAD_REQUEST", "domain parameter is required", undefined, 400);

  const ssoConfig = await db.sSOConfig.findFirst({
    where: { domain: { equals: domain, mode: "insensitive" }, enabled: true },
  });
  if (!ssoConfig?.discoveryUrl || !ssoConfig.clientId) {
    return errorResponse("NOT_FOUND", "SSO not configured for this domain", undefined, 404);
  }

  try {
    const { decrypt } = await import("@/lib/crypto-util");
    const clientSecret = ssoConfig.clientSecret ? decrypt(ssoConfig.clientSecret) : undefined;
    const oidcConfig = await client.discovery(new URL(ssoConfig.discoveryUrl), ssoConfig.clientId, clientSecret);
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();
    const authUrl = client.buildAuthorizationUrl(oidcConfig, {
      redirect_uri: CALLBACK_URL,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });
    const stateToken = jwt.sign({ codeVerifier, state, orgId: ssoConfig.orgId, domain }, getJwtSecret(), { expiresIn: 600 });
    const cookieStore = await cookies();
    const isSecure = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
    cookieStore.set(STATE_COOKIE, stateToken, { httpOnly: true, secure: isSecure, sameSite: "lax", maxAge: 600, path: "/" });
    return NextResponse.redirect(authUrl.href);
  } catch (err) {
    // Log internally but never echo the raw library error to the client .
    // OIDC errors can expose internal config details (discovery URL, client ID, etc.)
    console.error("SSO init error:", err);
    return NextResponse.json(
      { error: "SSO configuration error. Please contact your administrator." },
      { status: 500 },
    );
  }
}
