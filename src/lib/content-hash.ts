import { createHash } from "crypto";

/**
 * Compute a stable SHA-256 hash of a page's text content.
 * Strips script and style tags, then normalises whitespace so
 * minor formatting changes don't produce false positives.
 */
export function computeContentHash(html: string): string {
  // Remove <script> blocks (including inline JS)
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove <style> blocks
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Collapse whitespace and trim
  text = text.replace(/\s+/g, " ").trim();

  return createHash("sha256").update(text, "utf8").digest("hex");
}
