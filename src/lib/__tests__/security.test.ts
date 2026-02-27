import { describe, expect, it } from "vitest";
import { checkClientSideAuthBypass, checkSecurityHeaders, scanJavaScriptForKeys } from "@/lib/security";

describe("security checks", () => {
  it("detects missing security headers", () => {
    const headers = new Headers({ "content-type": "text/html" });
    const findings = checkSecurityHeaders(headers);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.code.includes("MISSING"))).toBe(true);
  });

  it("detects exposed API keys in JavaScript", () => {
    const findings = scanJavaScriptForKeys(["const key='sk-abcdefghijklmnopqrstuvwxyz123456';"]);
    expect(findings.length).toBe(1);
    expect(findings[0].severity).toBe("CRITICAL");
  });

  it("detects client-side auth bypass pattern", () => {
    const html = `<script>if(localStorage.getItem('isAdmin')==='true'){showAdmin()}</script>`;
    const findings = checkClientSideAuthBypass(html);
    expect(findings.length).toBe(1);
  });
});
