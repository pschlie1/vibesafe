import { describe, expect, it } from "vitest";
import { createAppSchema } from "@/lib/types";

describe("createAppSchema", () => {
  it("validates a correct app input", () => {
    const result = createAppSchema.safeParse({
      name: "Test App",
      url: "https://example.com",
      ownerEmail: "owner@example.com",
      criticality: "high",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = createAppSchema.safeParse({
      name: "Test App",
      url: "not-a-url",
      ownerEmail: "owner@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createAppSchema.safeParse({
      name: "Test App",
      url: "https://example.com",
      ownerEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("applies default criticality", () => {
    const result = createAppSchema.safeParse({
      name: "Test App",
      url: "https://example.com",
      ownerEmail: "owner@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.criticality).toBe("medium");
    }
  });
});
