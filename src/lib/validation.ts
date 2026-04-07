/**
 * Shared Zod validation schemas.
 *
 * Import from this module to ensure consistency across API routes.
 * All user-facing inputs must be validated with Zod before use.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Password complexity
// ---------------------------------------------------------------------------

/**
 * Strong password schema . requires minimum 12 characters plus at least one
 * uppercase letter, one lowercase letter, one digit, and one special character.
 */
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// ---------------------------------------------------------------------------
// Reserved org slug blocklist
// ---------------------------------------------------------------------------

/**
 * Slugs that must not be used as-is for organization identifiers because they
 * would shadow Next.js API routes, public pages, or infrastructure paths.
 */
export const RESERVED_SLUGS = new Set([
  "api",
  "v1",
  "admin",
  "www",
  "app",
  "static",
  "public",
  "auth",
  "dashboard",
  "settings",
  "billing",
  "login",
  "logout",
  "signup",
  "health",
  "status",
  "docs",
  "blog",
  "support",
  "help",
  "mail",
  "email",
  "smtp",
  "ftp",
  "cdn",
  "assets",
  "images",
  "uploads",
  "download",
  "downloads",
  "files",
  "media",
]);

/**
 * Returns true when `slug` exactly matches a reserved path segment.
 * The check is case-insensitive (caller should pass a lowercased slug).
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * Strict HTTP/HTTPS URL . rejects file://, ftp://, data:, javascript:, etc.
 * Use this for any user-supplied URL that will be fetched or rendered.
 */
export const urlSchema = z
  .string()
  .url({ message: "Must be a valid URL" })
  .refine(
    (u) => {
      try {
        const { protocol } = new URL(u);
        return protocol === "http:" || protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must use http:// or https:// protocol" },
  );

/** Email address */
export const emailSchema = z.string().email();

/** Non-empty string with trimming */
export const nonEmptyString = z.string().min(1).trim();

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Standard pagination query params.
 * Usage: `const { page, limit } = paginationSchema.parse({ page: sp.get("page"), limit: sp.get("limit") });`
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------------------------------------------------------------------------
// Finding status / severity enums
// ---------------------------------------------------------------------------

export const findingStatusSchema = z.enum([
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "IGNORED",
]);

export const findingSeveritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

// ---------------------------------------------------------------------------
// Date range (used by reporting endpoints)
// ---------------------------------------------------------------------------

export const dateRangeSchema = z
  .object({
    from: z.string().datetime({ message: "from must be an ISO 8601 datetime string" }),
    to: z.string().datetime({ message: "to must be an ISO 8601 datetime string" }),
  })
  .refine((d) => new Date(d.to) > new Date(d.from), {
    message: "'to' must be after 'from'",
  });
