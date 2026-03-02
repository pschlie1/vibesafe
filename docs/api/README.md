# Scantient API Documentation

Base URL: `https://scantient.com`

---

## Authentication

Scantient supports four authentication methods depending on the use-case:

### 1. Session Cookie (Dashboard UI)
- Set automatically by the browser after login via `/api/auth/login`
- Used by all dashboard page routes
- Cookie: `scantient-session` (HttpOnly, Secure, SameSite=Lax)

### 2. API Key (`X-API-Key` header) — v1 API
- Generated in **Settings → API Keys** (prefix: `vs_`)
- Sent as: `X-API-Key: vs_your_key_here`
- Rate-limited per org per tier (see Rate Limits section)
- Scoped to the organization that created the key

### 3. Agent Key (`X-Agent-Key` header) — Agent / CI endpoints
- Generated per-app for CI pipeline integration
- Sent as: `X-Agent-Key: your_agent_key_here`
- Used by `/api/agent/scan` and `/api/agent/pending`

### 4. Cron Secret (`Authorization: Bearer <secret>`) — Internal cron
- Set via `CRON_SECRET` environment variable
- Used only by Vercel's scheduled job calling `/api/cron/run`
- Validated with timing-safe comparison (audit-14)

---

## Error Response Format

All endpoints return JSON errors in this shape:

```json
{
  "error": "Human-readable error message"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Bad request — validation error (details in `error` field) |
| 401 | Unauthorized — missing or invalid credentials |
| 403 | Forbidden — valid credentials but insufficient permissions |
| 404 | Resource not found or not owned by requesting org |
| 409 | Conflict — resource already exists |
| 422 | Unprocessable — scan completed but found issues (CI scan) |
| 429 | Rate limited — `Retry-After` header indicates when to retry |
| 500 | Internal server error |
| 503 | Service unavailable (e.g., misconfigured environment) |

---

## Public Endpoints (No Auth Required)

### `POST /api/public/score`
**Purpose:** Free security score check for any URL (used by the landing page).  
**Auth:** None  
**Rate limit:** 5 requests / 15 minutes per IP

**Request:**
```json
{ "url": "https://example.com" }
```

**Response:**
```json
{
  "url": "https://example.com",
  "score": 72,
  "grade": "B",
  "status": "warning",
  "findings": [
    {
      "severity": "HIGH",
      "title": "Missing Content-Security-Policy header",
      "description": "..."
    }
  ]
}
```

---

### `GET /api/public/badge`
**Purpose:** SVG or JSON security badge for the authenticated org.  
**Auth:** None (uses `?slug=org-slug`)  
**Cache:** 5 minutes

**Query params:**
- `slug` (required) — org slug
- `format` — `svg` (default) or `json`

**SVG Response:** `<svg>` badge with grade and score.

**JSON Response:**
```json
{ "slug": "acme-corp", "score": 87, "grade": "A", "color": "#22c55e" }
```

---

### `GET /api/public/badge/[slug]`
**Purpose:** Per-org badge by URL slug (alternative URL format).  
**Auth:** None  
**Cache:** 5 minutes (public, CDN-cacheable)

---

### `POST /api/public/ci-scan`
**Purpose:** Run a security scan from a CI/CD pipeline. Fails with HTTP 422 if `failOn` threshold is breached.  
**Auth:** `X-Agent-Key` header (agent key generated per app)  
**Rate limit:** Tier-based (same as v1 scan limit)

**Request:**
```json
{
  "url": "https://staging.example.com",
  "failOn": "critical"
}
```
`failOn` options: `critical` (default) | `high` | `medium`

**Success Response (HTTP 200):**
```json
{
  "passed": true,
  "score": 85,
  "findingCount": 2,
  "findings": [...]
}
```

**Failure Response (HTTP 422):**
```json
{
  "passed": false,
  "score": 45,
  "findingCount": 7,
  "findings": [...],
  "failedOn": "critical"
}
```

---

## V1 API (API Key Required)

All v1 endpoints require `X-API-Key: vs_your_key_here`.

### `GET /api/v1/apps`
**Purpose:** List all monitored apps for the organization.  
**Rate limit:** None (read-only)

**Response:**
```json
{
  "apps": [
    {
      "id": "clx...",
      "name": "Production App",
      "url": "https://app.example.com",
      "status": "HEALTHY",
      "criticality": "HIGH",
      "lastCheckedAt": "2026-03-01T22:00:00Z",
      "uptimePercent": 99.97,
      "avgResponseMs": 230
    }
  ]
}
```

---

### `POST /api/v1/scan`
**Purpose:** Trigger an on-demand security scan.  
**Rate limit:** Tier-based per 24 hours (see Rate Limits section)

**Request (by appId):**
```json
{ "appId": "clx..." }
```

**Request (by URL — creates a temporary scan):**
```json
{ "url": "https://example.com" }
```

**Response:**
```json
{
  "result": {
    "id": "run_...",
    "appId": "clx...",
    "status": "HEALTHY",
    "score": 91,
    "findingCount": 1,
    "findings": [...]
  }
}
```

---

### `POST /api/v1/scan/[id]`
**Purpose:** Rescan a specific app by ID.  
**Rate limit:** Shared with `/api/v1/scan` (tier-based per 24h)

**Response:** Same as `POST /api/v1/scan`.

---

### `GET /api/v1/dashboard`
**Purpose:** Organization dashboard summary — overall health metrics.  
**Rate limit:** None (read-only)

**Response:**
```json
{
  "summary": {
    "totalApps": 12,
    "healthy": 9,
    "warning": 2,
    "critical": 1,
    "openCriticalFindings": 5
  },
  "apps": [...]
}
```

---

## Rate Limits

Rate limits are applied per organization (not per API key).

### Scan Limits (per 24 hours)

| Tier | Daily Scans |
|------|-------------|
| FREE | 3 |
| STARTER | 10 |
| PRO | 50 |
| ENTERPRISE | 200 |
| ENTERPRISE_PLUS | 200 |

Exceeded requests receive `HTTP 429` with a `Retry-After` header indicating seconds until the window resets.

### App Creation Limits

| Endpoint | Limit |
|----------|-------|
| `POST /api/apps` | 30 apps / hour per org |

### Authentication Limits

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/login` | 10 attempts / 15 min per IP |
| `POST /api/auth/forgot-password` | 5 requests / 15 min per IP |

### Public Endpoint Limits

| Endpoint | Limit |
|----------|-------|
| `POST /api/public/score` | 5 requests / 15 min per IP |
| `POST /api/public/ci-scan` | Tier-based (same as v1) |

---

## CORS Policy

| Endpoint group | Allowed origins |
|----------------|----------------|
| `/api/v1/*` | `https://scantient.com` (production) / `http://localhost:3000` (dev) |
| `/api/public/*` | `*` (open — public endpoints by design) |
| `/api/*` (all others) | `https://scantient.com` (production) / `http://localhost:3000` (dev) |

All endpoints respond to `OPTIONS` preflight requests.

---

## Agent API

### `POST /api/agent/scan`
**Auth:** `X-Agent-Key`  
**Purpose:** Trigger a scan from an agent or MCP integration.

### `GET /api/agent/pending`
**Auth:** `X-Agent-Key`  
**Purpose:** Retrieve pending scan jobs for an agent.

---

## Cron Endpoint (Internal)

### `GET /api/cron/run`
**Auth:** `Authorization: Bearer <CRON_SECRET>`  
**Purpose:** Executes scheduled HTTP scans for all due apps (triggered by Vercel Cron).  
**Security:** Validated with `crypto.timingSafeEqual` (audit-14).

**Response:**
```json
{
  "ok": true,
  "processed": 42,
  "results": [...]
}
```

This endpoint is not intended for external use.
