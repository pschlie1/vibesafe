/**
 * Compliance framework mappings.
 * Maps finding codes to SOC 2, OWASP Top 10 2021, and NIST CSF controls.
 *
 * Each finding code maps to:
 *   soc2    — SOC 2 Trust Services Criteria (CC-prefixed)
 *   owasp   — OWASP Top 10 2021 categories (A01-A10)
 *   nist    — NIST CSF 2.0 functions (Identify/Protect/Detect/Respond/Recover)
 */

// ─── OWASP Top 10 2021 ───────────────────────────────────────────────────────

export interface OWASPCategory {
  id: string; // e.g. "A01"
  name: string;
  description: string;
}

export const OWASP_CATEGORIES: Record<string, OWASPCategory> = {
  A01: {
    id: "A01",
    name: "Broken Access Control",
    description: "Access control enforces policy so users cannot act outside their intended permissions.",
  },
  A02: {
    id: "A02",
    name: "Cryptographic Failures",
    description: "Failures related to cryptography that expose sensitive data in transit or at rest.",
  },
  A03: {
    id: "A03",
    name: "Injection",
    description: "Hostile data sent to an interpreter causes unintended commands to execute.",
  },
  A04: {
    id: "A04",
    name: "Insecure Design",
    description: "Missing or ineffective control design leaves the application open to attack.",
  },
  A05: {
    id: "A05",
    name: "Security Misconfiguration",
    description: "Insecure default configurations, incomplete setups, or open cloud storage.",
  },
  A06: {
    id: "A06",
    name: "Vulnerable and Outdated Components",
    description: "Components with known vulnerabilities undermine the application's defenses.",
  },
  A07: {
    id: "A07",
    name: "Identification and Authentication Failures",
    description: "Weaknesses in authentication allow attackers to assume other users' identities.",
  },
  A08: {
    id: "A08",
    name: "Software and Data Integrity Failures",
    description: "Code and infrastructure lacking integrity checks allow unauthorized modification.",
  },
  A09: {
    id: "A09",
    name: "Security Logging and Monitoring Failures",
    description: "Insufficient logging and monitoring prevents breach detection and response.",
  },
  A10: {
    id: "A10",
    name: "Server-Side Request Forgery (SSRF)",
    description: "The application fetches remote resources without validating the user-supplied URL.",
  },
};

// ─── NIST CSF 2.0 Functions ──────────────────────────────────────────────────

export interface NISTFunction {
  id: string; // "GV" | "ID" | "PR" | "DE" | "RS" | "RC"
  name: string;
  description: string;
}

export const NIST_FUNCTIONS: Record<string, NISTFunction> = {
  GV: {
    id: "GV",
    name: "Govern",
    description: "Establish and maintain governance for cybersecurity risk management.",
  },
  ID: {
    id: "ID",
    name: "Identify",
    description: "Understand the organization's cybersecurity risk to systems, people, assets, and capabilities.",
  },
  PR: {
    id: "PR",
    name: "Protect",
    description: "Implement safeguards to ensure delivery of critical services.",
  },
  DE: {
    id: "DE",
    name: "Detect",
    description: "Identify the occurrence of a cybersecurity event.",
  },
  RS: {
    id: "RS",
    name: "Respond",
    description: "Take action regarding a detected cybersecurity incident.",
  },
  RC: {
    id: "RC",
    name: "Recover",
    description: "Maintain plans for resilience and restore capabilities impaired by cybersecurity incidents.",
  },
};

// ─── SOC 2 Control Reference ─────────────────────────────────────────────────

export interface SOC2Control {
  id: string; // e.g. "CC6.1"
  name: string;
  category: string;
}

export const SOC2_CONTROLS: Record<string, SOC2Control> = {
  "CC6.1": { id: "CC6.1", name: "Logical and Physical Access Controls", category: "Logical Access" },
  "CC6.2": { id: "CC6.2", name: "Registration and Authorization", category: "Logical Access" },
  "CC6.3": { id: "CC6.3", name: "Role-Based Access", category: "Logical Access" },
  "CC6.6": { id: "CC6.6", name: "Boundary Controls", category: "Logical Access" },
  "CC6.7": { id: "CC6.7", name: "Data Transmission Controls", category: "Logical Access" },
  "CC7.1": { id: "CC7.1", name: "Vulnerability and Threat Detection", category: "System Operations" },
  "CC7.2": { id: "CC7.2", name: "Security Event Monitoring", category: "System Operations" },
  "CC9.2": { id: "CC9.2", name: "Risk Mitigation", category: "Risk Management" },
  "A1.1": { id: "A1.1", name: "Capacity and Performance Management", category: "Availability" },
  "A1.2": { id: "A1.2", name: "Environmental Protections", category: "Availability" },
};

// ─── Finding → Framework Mapping ─────────────────────────────────────────────

export interface FrameworkMapping {
  soc2: string[]; // SOC 2 control IDs
  owasp: string[]; // OWASP Top 10 category IDs
  nist: string[]; // NIST CSF function IDs
}

export const FRAMEWORK_MAPPING: Record<string, FrameworkMapping> = {
  // Security headers
  MISSING_CSP: {
    soc2: ["CC6.1", "CC6.6"],
    owasp: ["A05"],
    nist: ["PR"],
  },
  MISSING_HSTS: {
    soc2: ["CC6.1", "CC6.7"],
    owasp: ["A02", "A05"],
    nist: ["PR"],
  },
  MISSING_X_FRAME_OPTIONS: {
    soc2: ["CC6.1"],
    owasp: ["A05"],
    nist: ["PR"],
  },
  MISSING_X_CONTENT_TYPE: {
    soc2: ["CC6.1"],
    owasp: ["A05"],
    nist: ["PR"],
  },
  MISSING_REFERRER_POLICY: {
    soc2: ["CC6.1"],
    owasp: ["A05"],
    nist: ["PR"],
  },
  MISSING_PERMISSIONS_POLICY: {
    soc2: ["CC6.6"],
    owasp: ["A05"],
    nist: ["PR"],
  },

  // Cookies
  INSECURE_COOKIE: {
    soc2: ["CC6.1", "CC6.7"],
    owasp: ["A02", "A05"],
    nist: ["PR"],
  },
  COOKIE_NO_HTTPONLY: {
    soc2: ["CC6.1"],
    owasp: ["A05"],
    nist: ["PR"],
  },
  COOKIE_NO_SAMESITE: {
    soc2: ["CC6.1"],
    owasp: ["A01", "A05"],
    nist: ["PR"],
  },

  // API keys and secrets
  EXPOSED_API_KEY: {
    soc2: ["CC6.1", "CC6.3", "CC9.2"],
    owasp: ["A02", "A05"],
    nist: ["ID", "PR"],
  },
  EXPOSED_SECRET: {
    soc2: ["CC6.1", "CC6.3"],
    owasp: ["A02"],
    nist: ["ID", "PR"],
  },

  // Authentication
  CLIENT_SIDE_AUTH_BYPASS: {
    soc2: ["CC6.2", "CC6.3"],
    owasp: ["A01", "A07"],
    nist: ["PR"],
  },
  FORM_NO_CSRF: {
    soc2: ["CC6.1"],
    owasp: ["A01"],
    nist: ["PR"],
  },

  // SSL
  SSL_CERT_EXPIRING: {
    soc2: ["CC6.7"],
    owasp: ["A02"],
    nist: ["PR", "RS"],
  },
  SSL_CERT_EXPIRED: {
    soc2: ["CC6.7", "A1.2"],
    owasp: ["A02"],
    nist: ["PR", "RS", "RC"],
  },
  INSECURE_CONTENT: {
    soc2: ["CC6.1"],
    owasp: ["A02"],
    nist: ["PR"],
  },

  // Information disclosure
  SERVER_HEADER_EXPOSED: {
    soc2: ["CC6.1"],
    owasp: ["A05"],
    nist: ["ID", "PR"],
  },
  X_POWERED_BY: {
    soc2: ["CC6.1"],
    owasp: ["A05"],
    nist: ["ID"],
  },

  // AI governance
  AI_TOOL_DETECTED: {
    soc2: ["CC6.1", "CC6.7", "CC9.2"],
    owasp: ["A06", "A08"],
    nist: ["GV", "ID"],
  },

  // Availability
  UPTIME_ERROR: {
    soc2: ["A1.1", "A1.2"],
    owasp: [],
    nist: ["DE", "RC"],
  },
  UPTIME_SLOW: {
    soc2: ["A1.2"],
    owasp: [],
    nist: ["DE"],
  },
};

// ─── Control Status ───────────────────────────────────────────────────────────

export type ControlStatus = "pass" | "fail" | "partial";

export interface SOC2ControlResult {
  controlId: string;
  control: SOC2Control;
  status: ControlStatus;
  violatingFindings: string[]; // finding codes that violate this control
}

export interface OWASPCategoryResult {
  categoryId: string;
  category: OWASPCategory;
  status: ControlStatus;
  violatingFindings: string[];
}

export interface NISTFunctionResult {
  functionId: string;
  function: NISTFunction;
  status: ControlStatus;
  violatingFindings: string[];
}

// ─── Exported Utilities ──────────────────────────────────────────────────────

/**
 * Maps an array of findings to SOC 2 control results.
 * Returns a result for every control in SOC2_CONTROLS.
 */
export function getSOC2Controls(
  findings: Array<{ code: string; title: string; severity: string }>,
): SOC2ControlResult[] {
  const openCodes = findings.map((f) => f.code);

  return Object.values(SOC2_CONTROLS).map((control) => {
    const violatingFindings = openCodes.filter((code) =>
      FRAMEWORK_MAPPING[code]?.soc2?.includes(control.id),
    );

    return {
      controlId: control.id,
      control,
      status: violatingFindings.length === 0 ? "pass" : "fail",
      violatingFindings,
    };
  });
}

/**
 * Maps an array of findings to OWASP Top 10 2021 category results.
 * Returns a result for every OWASP category.
 */
export function getOWASPMapping(
  findings: Array<{ code: string; title: string; severity: string }>,
): OWASPCategoryResult[] {
  const openCodes = findings.map((f) => f.code);

  return Object.values(OWASP_CATEGORIES).map((category) => {
    const violatingFindings = openCodes.filter((code) =>
      FRAMEWORK_MAPPING[code]?.owasp?.includes(category.id),
    );

    return {
      categoryId: category.id,
      category,
      status: violatingFindings.length === 0 ? "pass" : "fail",
      violatingFindings,
    };
  });
}

/**
 * Maps an array of findings to NIST CSF function results.
 * Returns a result for every NIST function.
 */
export function getNISTMapping(
  findings: Array<{ code: string; title: string; severity: string }>,
): NISTFunctionResult[] {
  const openCodes = findings.map((f) => f.code);

  return Object.values(NIST_FUNCTIONS).map((fn) => {
    const violatingFindings = openCodes.filter((code) =>
      FRAMEWORK_MAPPING[code]?.nist?.includes(fn.id),
    );

    return {
      functionId: fn.id,
      function: fn,
      status: violatingFindings.length === 0 ? "pass" : "fail",
      violatingFindings,
    };
  });
}

/** Compute a 0-100 score for a framework based on how many controls pass. */
export function frameworkPassRate(results: Array<{ status: ControlStatus }>): number {
  if (results.length === 0) return 100;
  const passed = results.filter((r) => r.status === "pass").length;
  return Math.round((passed / results.length) * 100);
}
