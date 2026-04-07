import crypto from "node:crypto";
import { db } from "@/lib/db";

// API keys use a "vs_" prefix . reject anything that doesn't match before hitting the DB.
const API_KEY_PREFIX = "vs_";
const API_KEY_MIN_LENGTH = 10;  // Must have prefix + at least 7 chars
const API_KEY_MAX_LENGTH = 60;  // Generous ceiling; prevents extreme-length DB queries

// Tiers that are allowed to use API key authentication.
const API_KEY_ALLOWED_TIERS = ["LTD", "PRO", "ENTERPRISE", "ENTERPRISE_PLUS"];

/**
 * Core API key lookup: finds the key record and eagerly loads the org subscription
 * in a single query to avoid a second round-trip for tier verification.
 */
async function findApiKey(hash: string) {
  return db.apiKey.findFirst({
    where: { keyHash: hash },
    include: {
      org: {
        include: { subscription: true },
      },
    },
  });
}

async function recordKeyUsed(keyId: string, orgId: string, keyPrefix: string, source?: string) {
  await db.apiKey.update({ where: { id: keyId }, data: { lastUsedAt: new Date() } });
  await db.auditLog.create({
    data: {
      orgId,
      action: "API_KEY_USED",
      resource: `apikey:${keyId}`,
      details: JSON.stringify({ keyPrefix, ...(source ? { source } : {}) }),
    },
  }).catch(() => {});
}

/**
 * Authenticate a request using an API key from the X-API-Key header.
 * Used by public/CI endpoints.
 */
export async function authenticateApiKeyHeader(req: Request): Promise<string | null> {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey?.startsWith(API_KEY_PREFIX) || apiKey.length < API_KEY_MIN_LENGTH || apiKey.length > API_KEY_MAX_LENGTH) return null;

  const hash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const key = await findApiKey(hash);
  if (!key) return null;
  if (key.expiresAt && key.expiresAt < new Date()) return null;

  const tier = key.org.subscription?.tier ?? "FREE";
  if (!API_KEY_ALLOWED_TIERS.includes(tier)) return null;

  await recordKeyUsed(key.id, key.orgId, key.keyPrefix, "x-api-key-header");
  return key.orgId;
}

/**
 * Authenticate a request using a Scantient API key (Bearer token).
 * Returns the orgId if valid and org has an active PRO+ subscription, null otherwise.
 */
export async function authenticateApiKey(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith(`Bearer ${API_KEY_PREFIX}`)) return null;

  const token = auth.slice(7);
  if (token.length < API_KEY_MIN_LENGTH || token.length > API_KEY_MAX_LENGTH) return null;

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const key = await findApiKey(hash);
  if (!key) return null;
  if (key.expiresAt && key.expiresAt < new Date()) return null;

  const tier = key.org.subscription?.tier ?? "FREE";
  if (!API_KEY_ALLOWED_TIERS.includes(tier)) return null;

  await recordKeyUsed(key.id, key.orgId, key.keyPrefix);
  return key.orgId;
}
