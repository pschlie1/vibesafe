import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { getOrgLimits } from "@/lib/tenant";
import { encrypt, decrypt } from "@/lib/crypto-util";
import { isPrivateUrl } from "@/lib/ssrf-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasFeature } from "@/lib/tier-capabilities";
import { errorResponse, zodFieldErrors } from "@/lib/api-response";

const jiraConfigSchema = z.object({
  url: z.string().url(),
  email: z.string().email(),
  apiToken: z.string().min(1),
  projectKey: z.string().min(1),
  issueType: z.string().min(1),
});

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "OWNER"]);
    const limits = await getOrgLimits(session.orgId);
    if (!hasFeature(limits.tier, "jira")) {
      return NextResponse.json(
        { error: "Jira integration is available on Pro and Enterprise plans. Upgrade to connect your Jira workspace." },
        { status: 403 },
      );
    }
    const integration = await db.integrationConfig.findUnique({
      where: { orgId_type: { orgId: session.orgId, type: "jira" } },
    });
    if (!integration) return NextResponse.json(null);
    const cfg = integration.config as Record<string, string>;
    return NextResponse.json({ url: cfg.url, email: cfg.email, apiToken: "••••••••", projectKey: cfg.projectKey, issueType: cfg.issueType, enabled: integration.enabled });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    return errorResponse(msg === "Forbidden" ? "FORBIDDEN" : "UNAUTHORIZED", msg, undefined, msg === "Forbidden" ? 403 : 401);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "OWNER"]);
    const limits = await getOrgLimits(session.orgId);
    if (!hasFeature(limits.tier, "jira")) {
      return NextResponse.json(
        { error: "Jira integration is available on Pro and Enterprise plans. Upgrade to connect your Jira workspace." },
        { status: 403 },
      );
    }
    const rl = await checkRateLimit(`integration-jira:${session.orgId}`, {
      maxAttempts: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
    }
    const body = await req.json();
    const parsed = jiraConfigSchema.safeParse(body);
    if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Validation failed", zodFieldErrors(parsed.error.flatten().fieldErrors), 400);
    if (await isPrivateUrl(parsed.data.url)) {
      return errorResponse("BAD_REQUEST", "Jira URL must be a public address", undefined, 400);
    }
    const { url, email, apiToken, projectKey, issueType } = parsed.data;
    const config = { url, email, apiToken: encrypt(apiToken), projectKey, issueType };
    const integration = await db.integrationConfig.upsert({
      where: { orgId_type: { orgId: session.orgId, type: "jira" } },
      create: { orgId: session.orgId, type: "jira", config, enabled: true },
      update: { config, enabled: true },
    });
    return NextResponse.json({ id: integration.id, ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    return errorResponse(msg === "Forbidden" ? "FORBIDDEN" : "UNAUTHORIZED", msg, undefined, msg === "Forbidden" ? 403 : 401);
  }
}

export async function DELETE() {
  try {
    const session = await requireRole(["ADMIN", "OWNER"]);
    const limits = await getOrgLimits(session.orgId);
    if (!hasFeature(limits.tier, "jira")) {
      return NextResponse.json(
        { error: "Jira integration is available on Pro and Enterprise plans. Upgrade to connect your Jira workspace." },
        { status: 403 },
      );
    }
    const rl = await checkRateLimit(`integration-jira:${session.orgId}`, {
      maxAttempts: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429, { "Retry-After": String(rl.retryAfterSeconds ?? 60) });
    }
    await db.integrationConfig.deleteMany({ where: { orgId: session.orgId, type: "jira" } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    return errorResponse(msg === "Forbidden" ? "FORBIDDEN" : "UNAUTHORIZED", msg, undefined, msg === "Forbidden" ? 403 : 401);
  }
}

export async function getJiraConfig(orgId: string) {
  const integration = await db.integrationConfig.findUnique({
    where: { orgId_type: { orgId, type: "jira" } },
  });
  if (!integration || !integration.enabled) return null;
  const cfg = integration.config as Record<string, string>;
  return { url: cfg.url, email: cfg.email, apiToken: decrypt(cfg.apiToken), projectKey: cfg.projectKey, issueType: cfg.issueType };
}
