/**
 * POST /api/compliance/share
 *
 * Generates a time-limited, read-only auditor link for the compliance evidence package.
 * The link is valid for 7 days. Gated to ENTERPRISE and ENTERPRISE_PLUS.
 *
 * Returns: { token: string; expiresAt: string; url: string }
 */

import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getSession } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const ALLOWED_TIERS = ["ENTERPRISE", "ENTERPRISE_PLUS"];
const LINK_TTL_DAYS = 7;

function getSecret(): string {
  const s = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("No signing secret configured");
  return s;
}

/** Sign `payload` with HMAC-SHA256 and return a URL-safe base64 token. */
function signPayload(payload: object): string {
  const secret = getSecret();
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Unauthorized", undefined, 401);
  }

  const limits = await getOrgLimits(session.orgId);
  if (!ALLOWED_TIERS.includes(limits.tier)) {
    return NextResponse.json(
      { error: "Auditor links require an Enterprise plan." },
      { status: 403 },
    );
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + LINK_TTL_DAYS);

  const payload = {
    orgId: session.orgId,
    exp: Math.floor(expiresAt.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
  };

  const token = signPayload(payload);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scantient.com";
  const url = `${baseUrl}/api/public/compliance?token=${token}`;

  return NextResponse.json({
    token,
    expiresAt: expiresAt.toISOString(),
    url,
    expiresInDays: LINK_TTL_DAYS,
  });
}
