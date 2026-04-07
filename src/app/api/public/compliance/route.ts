/**
 * GET /api/public/compliance?token=<signed-token>
 *
 * Public read-only endpoint for auditor access.
 * Validates the HMAC-signed token and returns the evidence package JSON.
 * No authentication cookie required.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/api-response";
import {
  getSOC2Controls,
  getOWASPMapping,
  getNISTMapping,
  frameworkPassRate,
} from "@/lib/compliance-frameworks";

export const dynamic = "force-dynamic";

function getSecret(): string {
  const s = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("No signing secret configured");
  return s;
}

interface TokenPayload {
  orgId: string;
  exp: number;
  iat: number;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;

    const secret = getSecret();
    const expected = createHmac("sha256", secret).update(data).digest("base64url");
    if (expected !== sig) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as TokenPayload;
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return errorResponse("BAD_REQUEST", "Missing token", undefined, 400);
  }

  const payload = verifyToken(token);
  if (!payload) {
    return errorResponse("UNAUTHORIZED", "Invalid or expired link", undefined, 401);
  }

  const org = await db.organization.findUnique({
    where: { id: payload.orgId },
    select: { id: true, name: true },
  });
  if (!org) {
    return errorResponse("NOT_FOUND", "Organization not found", undefined, 404);
  }

  const openFindings = await db.finding.findMany({
    where: {
      status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
      run: { app: { orgId: payload.orgId } },
    },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      severity: true,
      status: true,
      createdAt: true,
      app: { select: { id: true, name: true, url: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "asc" }],
    take: 2000,
  });

  const findingInputs = openFindings.map((f) => ({
    code: f.code,
    title: f.title,
    severity: f.severity,
  }));

  const soc2Controls = getSOC2Controls(findingInputs);
  const owaspCategories = getOWASPMapping(findingInputs);
  const nistFunctions = getNISTMapping(findingInputs);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    orgId: org.id,
    orgName: org.name,
    readOnly: true,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    soc2: {
      score: frameworkPassRate(soc2Controls),
      passedControls: soc2Controls.filter((c) => c.status === "pass").length,
      totalControls: soc2Controls.length,
      controls: soc2Controls,
    },
    owasp: {
      score: frameworkPassRate(owaspCategories),
      passedCategories: owaspCategories.filter((c) => c.status === "pass").length,
      totalCategories: owaspCategories.length,
      categories: owaspCategories,
    },
    nist: {
      score: frameworkPassRate(nistFunctions),
      passedFunctions: nistFunctions.filter((f) => f.status === "pass").length,
      totalFunctions: nistFunctions.length,
      functions: nistFunctions,
    },
    openFindings: openFindings.map((f) => ({
      id: f.id,
      code: f.code,
      title: f.title,
      severity: f.severity,
      status: f.status,
      detectedAt: f.createdAt.toISOString(),
      app: f.app ? { id: f.app.id, name: f.app.name, url: f.app.url } : null,
    })),
  });
}
