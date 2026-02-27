import { buildFixPrompt } from "@/lib/remediation";
import type { SecurityFinding } from "@/lib/types";

const KEY_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g,
  /AIza[0-9A-Za-z\-_]{35}/g,
  /(?<![A-Z0-9_])SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'`][^"'`]{20,}["'`]/g,
];

export function checkSecurityHeaders(headers: Headers): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const required: Array<[string, string]> = [
    ["content-security-policy", "Add CSP to reduce XSS risk"],
    ["x-frame-options", "Set X-Frame-Options to DENY or SAMEORIGIN"],
    ["strict-transport-security", "Enable HSTS for HTTPS"],
  ];

  for (const [header, action] of required) {
    if (!headers.get(header)) {
      findings.push({
        code: `MISSING_${header.toUpperCase().replace(/-/g, "_")}`,
        title: `Missing security header: ${header}`,
        description: `Header ${header} is absent. ${action}.`,
        severity: "HIGH",
        fixPrompt: buildFixPrompt(`Missing ${header}`, `Set ${header} on all responses.`),
      });
    }
  }

  return findings;
}

export function scanJavaScriptForKeys(jsPayloads: string[]): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  jsPayloads.forEach((payload, idx) => {
    for (const pattern of KEY_PATTERNS) {
      const match = payload.match(pattern);
      if (match?.length) {
        findings.push({
          code: "EXPOSED_API_KEY",
          title: "Potential exposed API key in client-side JavaScript",
          description: `Detected ${match.length} secret-like token(s) in JS asset #${idx + 1}.`,
          severity: "CRITICAL",
          fixPrompt: buildFixPrompt(
            "Exposed API key in frontend bundle",
            "Move secret usage server-side, rotate exposed keys, and add tests preventing key leakage in built JS."
          ),
        });
      }
    }
  });

  return findings;
}

export function checkClientSideAuthBypass(html: string): SecurityFinding[] {
  if (/localStorage\.(getItem|setItem)\(['"]isAdmin['"]/.test(html)) {
    return [
      {
        code: "CLIENT_SIDE_AUTH_BYPASS",
        title: "Client-side auth trust pattern detected",
        description:
          "Found auth gating in client storage/UI logic. Authorization must be enforced on server/API.",
        severity: "HIGH",
        fixPrompt: buildFixPrompt(
          "Client-side auth bypass risk",
          "Enforce authorization checks on server endpoints and use signed session validation."
        ),
      },
    ];
  }

  return [];
}
