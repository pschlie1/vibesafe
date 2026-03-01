/**
 * Onboarding utilities.
 * Helps surface value fast by suggesting a URL to scan based on work email domain.
 */

const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "protonmail.com",
  "me.com",
  "googlemail.com",
  "yahoo.co.uk",
  "hotmail.co.uk",
  "live.com",
  "msn.com",
  "aol.com",
];

/**
 * Extract a suggested domain URL from a work email address.
 * Returns null for personal email providers and malformed addresses.
 *
 * @example
 * extractSuggestedDomain("alice@acme.com") // "https://acme.com"
 * extractSuggestedDomain("alice@gmail.com") // null
 * extractSuggestedDomain("notanemail") // null
 */
export function extractSuggestedDomain(email: string): string | null {
  if (!email || typeof email !== "string") return null;

  const atIdx = email.indexOf("@");
  if (atIdx === -1) return null;

  const domain = email.slice(atIdx + 1).toLowerCase().trim();
  if (!domain || domain.length < 3) return null;

  // Must look like a real domain (has at least one dot)
  if (!domain.includes(".")) return null;

  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) return null;

  return `https://${domain}`;
}
