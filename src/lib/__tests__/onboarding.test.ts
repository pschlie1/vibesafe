/**
 * onboarding.test.ts
 *
 * Tests for extractSuggestedDomain utility.
 */

import { describe, expect, it } from "vitest";
import { extractSuggestedDomain } from "@/lib/onboarding";

describe("extractSuggestedDomain", () => {
  it("returns null for gmail.com addresses", () => {
    expect(extractSuggestedDomain("alice@gmail.com")).toBeNull();
  });

  it("returns null for hotmail.com addresses", () => {
    expect(extractSuggestedDomain("bob@hotmail.com")).toBeNull();
  });

  it("returns null for yahoo.com addresses", () => {
    expect(extractSuggestedDomain("charlie@yahoo.com")).toBeNull();
  });

  it("returns null for outlook.com addresses", () => {
    expect(extractSuggestedDomain("dave@outlook.com")).toBeNull();
  });

  it("returns null for icloud.com addresses", () => {
    expect(extractSuggestedDomain("eve@icloud.com")).toBeNull();
  });

  it("returns null for protonmail.com addresses", () => {
    expect(extractSuggestedDomain("frank@protonmail.com")).toBeNull();
  });

  it("returns suggested domain for corporate email", () => {
    expect(extractSuggestedDomain("alice@acme.com")).toBe("https://acme.com");
  });

  it("returns suggested domain for another corporate email", () => {
    expect(extractSuggestedDomain("cto@bigcorp.io")).toBe("https://bigcorp.io");
  });

  it("returns suggested domain in lowercase", () => {
    expect(extractSuggestedDomain("CEO@ENTERPRISE.COM")).toBe("https://enterprise.com");
  });

  it("handles subdomain corporate email", () => {
    expect(extractSuggestedDomain("user@us.megacorp.com")).toBe("https://us.megacorp.com");
  });

  it("handles malformed email gracefully — no @ sign", () => {
    expect(extractSuggestedDomain("notanemail")).toBeNull();
  });

  it("handles malformed email gracefully — empty string", () => {
    expect(extractSuggestedDomain("")).toBeNull();
  });

  it("handles malformed email gracefully — @ at end", () => {
    expect(extractSuggestedDomain("user@")).toBeNull();
  });

  it("handles malformed email gracefully — domain without dot", () => {
    expect(extractSuggestedDomain("user@localhost")).toBeNull();
  });

  it("handles null/undefined gracefully", () => {
    // @ts-expect-error: testing runtime safety
    expect(extractSuggestedDomain(null)).toBeNull();
    // @ts-expect-error: testing runtime safety
    expect(extractSuggestedDomain(undefined)).toBeNull();
  });
});
