# Scantient Scanning Functionality Audit
**Date:** 2026-04-04  
**Auditor:** Dooder  
**Angle:** Completeness, accuracy, and value to vibe-coded app developers

---

## Executive Summary

The scanner is **substantively strong** — 20+ check functions, a smart URL classifier, a two-tier architecture (passive HTTP checks + active auth probing), bot challenge bypasses, and AI tool detection. Most checks a vibe coder would care about are covered.

**But there are 7 meaningful gaps** that represent real risks vibe-coded apps ship with, and where Scantient currently gives no signal:

1. **Secret scanning too narrow** — only 8 providers covered; Firebase, JWT, database URLs, Resend/SendGrid API keys in env-style formats are missed
2. **No environment variable leakage detection** — `/api/debug`, `process.env` dumps, `/api/env` endpoints are common in vibe-coded apps and not checked
3. **Auth endpoint discovery misses custom path patterns** — frameworks like Hono, Elysia, Bun, Fastify are not fingerprinted
4. **No subdomain enumeration / takeover check** — dangling DNS pointing to Heroku/Render/Vercel preview is a genuine vibe coder risk
5. **Rate-limit check is header-only** — doesn't actually probe whether rate limiting *works*
6. **No SQL injection / prompt injection detection** — basic SQLi in vibe-coded apps is common; no check exists
7. **Dependency version detection is JavaScript-only** — Python (pip), Go, Ruby gems are not covered

---

## What's Working Well

### ✅ Scan Architecture
- **URL context classifier** — correctly routes checks by URL type (api-endpoint vs homepage vs login-page vs health). Prevents false positives and noise.
- **Two-tier design** — Tier 1 is passive HTTP + static analysis; Tier 2 is active auth surface probing. Clean separation.
- **Bot challenge bypass** — Probe endpoint first, then Playwright browser fallback. Handles Cloudflare/Vercel bot protection correctly.
- **SSRF guard** — `ssrfSafeFetch` with per-hop checks and a 5-redirect cap. Safe for scanning user-supplied URLs.
- **Content change detection** — SHA hash comparison between scans. Detects defacement or unexpected deployments. Useful for vibe coders who forget what they last deployed.
- **Atomic scan claiming** — `$transaction` prevents two cron instances from double-scanning the same app. Correct.
- **Finding deduplication** — upsert by `(appId, code)`, re-opens resolved findings if they recur. Good lifecycle model.
- **Performance regression** — detects 2x slowdowns vs baseline. Relevant for vibe coders who add an LLM call and forget it's synchronous in the critical path.

### ✅ Checks That Directly Hit Vibe Coder Pain
| Check | Why it matters for vibe-coded apps |
|-------|-------------------------------------|
| `scanJavaScriptForKeys` | Cursor/Copilot codegen regularly puts API keys in client bundles |
| `checkCORSMisconfiguration` | Vibe coders often set `Access-Control-Allow-Origin: *` globally |
| `checkSecurityHeaders` | Missing CSP/HSTS is the default; vibe coders don't set these |
| `checkClientSideAuthBypass` | `if (user.role === 'admin')` in JSX is extremely common |
| `checkAITools` — 12 providers | Detects OpenAI/Anthropic/etc. in production without a policy |
| `checkFormSecurity` | Forms with `/api` actions + no CSRF is standard vibe code output |
| `checkDependencyVersions` | Outdated React/jQuery/Bootstrap detected from JS bundles |
| `runAuthScan` | Rate limiting, account enumeration, CSRF on auth endpoints |
| `checkSSLCertExpiry` | Forgotten cert renewals; vibe coders don't watch these |

### ✅ AI Policy Scanner
Genuinely differentiated. Detects 12 AI providers across 5 vectors (CSP, script-src, JS bundle, HTML inline, response headers). The `policyStatus: "unclassified"` framing is exactly right for the compliance/enterprise angle.

---

## Gaps — Ranked by Impact on Vibe-Coded Apps

### 🔴 P0 — High-Value, Low Effort

**1. Secret scanning coverage too narrow**

Current patterns cover: AWS, OpenAI, Anthropic, Google API key, GitHub tokens, Slack tokens, Twilio, SendGrid.

Missing patterns vibe coders regularly leak:
```
Firebase API key:    AIza... (covered) but firebase.json config files are not
JWT secrets:         "jwt_secret": "...", JWT_SECRET=supersecretstring123
Database URLs:       postgres://user:pass@host/db, mongodb+srv://user:pass@cluster
Resend API key:      re_[A-Za-z0-9]{32,} (ironic since Scantient uses Resend itself)
Vercel tokens:       vercel_[a-zA-Z0-9]{24,}
Linear API keys:     lin_api_[a-zA-Z0-9]{40}
Planetscale tokens:  pscale_tkn_[a-zA-Z0-9]{32,}
Supabase service role key in .env format exposed via JS bundle
Generic secret:      SECRET_KEY\s*=\s*["'][^"']{16,}["']
Generic password:    DB_PASSWORD\s*=\s*["'][^"']{8,}["']
```
Fix: Add 10-15 patterns to `KEY_PATTERNS` in `security.ts`. ~30 min.

**2. No environment variable / debug endpoint detection**

`/api/debug`, `/api/env`, `/api/config`, `/__debug`, `/server-info` are endpoints Cursor/Copilot codegen produces in vibe-coded apps. They often dump `process.env` or entire app config. Currently not checked in `checkExposedEndpoints`.

The wordlist in `checkExposedEndpoints` needs:
```
/api/debug
/api/env
/api/config
/api/system
/__env
/debug
/.env.local (if web-accessible)
/config.json
/app-config.json
```

Fix: Add to the endpoint wordlist in `security.ts`. ~20 min.

---

### 🟠 P1 — Medium Impact

**3. Framework fingerprinting misses modern vibe-coding stacks**

`endpoint-discovery.ts` fingerprints: Next.js (NextAuth), Supabase, Clerk, Laravel, Django, Rails, Express, Flask.

Missing frameworks vibe coders use heavily in 2025-2026:
- **Hono** (bun/edge workers) — auth paths: `/api/auth/*`, no standard pattern
- **Elysia** (Bun) — no fingerprint
- **Fastify** (Node) — no fingerprint
- **tRPC** — `/api/trpc/*` is discoverable from HTML
- **Remix** — `__remix_route` signals + `/api/*` patterns
- **SvelteKit** — `__sveltekit`, `/api/auth/` paths

Impact: auth endpoint discovery misses these apps entirely, so the Tier 1 auth checks don't fire even when the app has vulnerable auth routes.

**4. Rate-limit check is signal-only, not behavioral**

`checkRateLimiting` checks for `X-RateLimit-*` response headers. But many vibe-coded apps:
- Have rate-limit middleware that doesn't set headers
- Have rate-limit middleware that's misconfigured (limit is 10,000/hr, effectively off)
- Return 200 for all requests (the rate limit is in middleware but only applies to POST, not GET)

Better approach: send 6-10 rapid requests and check if the response changes. The existing `DUMMY_EMAIL_NONEXISTENT` flow already makes multiple requests — add a probe that hits the same endpoint 6 times in 500ms and checks for a 429.

**5. No subdomain takeover check**

Vibe coders frequently:
- Deploy to `preview.myapp.com` → Vercel/Render/Railway preview URL
- Tear down the preview but forget to remove the CNAME
- Leave dangling DNS pointing at a taken-down Heroku/Netlify site

Classic takeover targets: `*.vercel.app`, `*.netlify.app`, `*.render.com`, `*.railway.app`, `*.fly.dev`.

A check that fetches subdomains from `robots.txt`, `sitemap.xml`, HTML links, and tries each — then checks if the response is a "claim this site" page from a known host — would catch this.

---

### 🟡 P2 — Lower Priority But Differentiating

**6. No SQL injection probe (even basic)**

Vibe-coded apps frequently have raw SQL in API routes. A basic test: append `'` or `'; SELECT 1; --` to a query parameter and check if the response is a 500 with a DB error message in the body.

This is in the spirit of what `checkAccountEnumeration` already does (active probing). Extend `runAuthScan` with a basic SQLi check on discovered API endpoints.

**7. OWASP API Top 10 — gaps**

| OWASP API Risk | Covered? | Notes |
|----------------|----------|-------|
| API1: Broken Object Level Auth | ⚠️ Partial | CORS + auth checks but no IDOR probe |
| API2: Broken Auth | ✅ | Auth scan, rate limit, CSRF |
| API3: Broken Object Property Level Auth | ❌ | No mass assignment / over-posting check |
| API4: Unrestricted Resource Consumption | ⚠️ Partial | Rate limit headers only |
| API5: Broken Function Level Auth | ✅ | Admin endpoint unauthed check |
| API6: Unrestricted Access to Sensitive Business Flows | ❌ | No check |
| API7: Server Side Request Forgery | ✅ | ssrfSafeFetch guards scanning |
| API8: Security Misconfiguration | ✅ | Headers, CORS, GraphQL introspection |
| API9: Improper Inventory Management | ⚠️ Partial | Endpoint discovery, OpenAPI exposure |
| API10: Unsafe Consumption of APIs | ⚠️ Partial | AI tool detection covers this partially |

**8. Source map exposure check is present but shallow**

`SOURCE_MAP_EXPOSED` finding exists. Good. But the check should also:
- Parse the source map and look for secrets/debug info within it
- Check if the source map exposes internal path structure revealing server architecture

**9. No check for exposed `.git` directory**

`/.git/config`, `/.git/HEAD` exposure is extremely common in vibe-coded apps deployed without a proper `.gitignore` or with incorrect Nginx/Caddy config. Not in the wordlist.

**10. `checkThirdPartyScripts` CDN compromised check is heuristic-only**

Currently checks if scripts are loaded over HTTP (vs HTTPS) and from unusual CDNs. Should also check against a known-compromised CDN list (polyfill.io was compromised in 2024 — a major incident). Worth adding a blocklist of known-compromised CDN domains.

---

## Recommended Fix Roadmap

### Sprint 1 (2-3 hrs) — P0 fixes
1. **Expand `KEY_PATTERNS`** in `security.ts` — add JWT secrets, DB URLs, Resend, Vercel, Linear, Planetscale, generic secret/password patterns
2. **Expand `checkExposedEndpoints` wordlist** — add `/api/debug`, `/api/env`, `/api/config`, `/.env.local`, `/config.json`
3. **Add `/.git/config` to exposed endpoint wordlist**

### Sprint 2 (4-6 hrs) — P1 fixes
4. **Add Hono/Elysia/Bun/tRPC/Remix/SvelteKit fingerprints** to `endpoint-discovery.ts`
5. **Make rate-limit check behavioral** — send 6 rapid requests in `checkRateLimiting`, detect actual enforcement
6. **Add `RESEND_API_KEY` to key patterns** + new finding code `RESEND_KEY_EXPOSED`

### Sprint 3 (6-10 hrs) — Differentiating
7. **Basic SQLi probe** in `runAuthScan` on discovered query endpoints
8. **Subdomain takeover detector** — scan linked subdomains against known "claim this" pages
9. **Blocklist for compromised CDNs** in `checkThirdPartyScripts` (polyfill.io + derivatives)
10. **Source map content scanning** — parse exposed source maps and run key patterns against contents

---

## Coverage Stats

| Category | Checks | Finding Codes |
|----------|--------|---------------|
| Security headers | 6 | 6 |
| TLS/SSL | 5 | 4 |
| JavaScript / client bundle | 4 | 8 |
| CORS | 4 | 4 |
| Auth surface (Tier 1) | 10 | 9 |
| Performance | 3 | 4 |
| Information disclosure | 3 | 6 |
| AI tools | 1 (12 providers) | 1 |
| Uptime | 1 | 4 |
| Third-party scripts | 1 | 4 |
| Forms | 1 | 3 |
| Dependencies | 2 | 5 |
| Content integrity | 1 | 1 |
| **Total** | **~20 check functions** | **~70 finding codes** |

**Vibe coder coverage estimate: ~65%.** The P0 fixes would push this to ~80%.

---

## Verdict

The scanner is legitimate and differentiated — especially the AI policy scanner and the two-tier auth probe. The foundation is solid. The gaps are real but fixable, and none require architectural changes. Priority is expanding the secret key patterns and debug endpoint wordlist — those two fixes alone would catch the most common things vibe coders accidentally ship to production.

---
*Generated by Dooder — manual code review, 2026-04-04*
