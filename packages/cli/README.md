# @scantient/cli

> Scan any URL for API security vulnerabilities in 60 seconds — from your terminal, CI pipeline, or agent workflow.

[![npm version](https://img.shields.io/npm/v/@scantient/cli)](https://www.npmjs.com/package/@scantient/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Installation

```bash
# Global install (recommended)
npm install -g @scantient/cli

# Or run without installing
npx @scantient/cli scan https://api.example.com
```

---

## Quick Start

```bash
# Free quick scan — no API key needed
scantient scan https://api.example.com

# Authenticated scan (higher rate limits, more detail)
scantient scan https://api.example.com --key sk_live_xxx

# Or set your key once via environment variable
export SCANTIENT_API_KEY=sk_live_xxx
scantient scan https://api.example.com
```

---

## Commands

### `scantient scan <url>`

Scan a URL for all security vulnerabilities.

```bash
scantient scan <url> [options]

Options:
  -k, --key <apiKey>       API key (or set SCANTIENT_API_KEY env var)
  -j, --json               Output raw JSON (for piping / agents)
  -t, --timeout <seconds>  Request timeout in seconds (default: 30)
  -h, --help               Show help

Examples:
  scantient scan https://api.example.com
  scantient scan https://api.example.com --key sk_live_xxx
  scantient scan https://api.example.com --json | jq '.score'
  scantient scan https://api.example.com --json > results.json
```

**Sample output:**
```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SCANTIENT SECURITY SCAN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  URL:    https://api.example.com
  Score:  72 / 100
  Grade:  [ C ]

  Findings: 3 total
    🔴 1 Critical
    🟠 1 High
    🟡 1 Medium

  ─────────────────────────────────────────
  🔴 CRITICAL  Missing HSTS Header
  Description: HTTP Strict Transport Security is not set
  Fix:         Add: Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

### `scantient ci <url>`

CI/CD mode: exits with code `0` if scan passes, `1` if it fails the minimum score threshold.

```bash
scantient ci <url> [options]

Options:
  -k, --key <apiKey>       API key (or set SCANTIENT_API_KEY env var)
  -m, --min-score <score>  Minimum passing score 0-100 (default: 80)
  -j, --json               Output raw JSON
  -t, --timeout <seconds>  Request timeout (default: 30)
  -h, --help               Show help

Examples:
  scantient ci https://api.example.com --min-score 80
  scantient ci https://api.example.com --min-score 70 --key sk_live_xxx
```

---

### `scantient check headers <url>`

Check only security headers (Content-Security-Policy, HSTS, X-Frame-Options, etc.).

```bash
scantient check headers https://api.example.com
scantient check headers https://api.example.com --json
```

---

### `scantient check ssl <url>`

Check SSL certificate validity, expiry, and configuration.

```bash
scantient check ssl https://api.example.com
scantient check ssl https://api.example.com --key sk_live_xxx
```

---

### `scantient check cors <url>`

Check CORS configuration for misconfigurations.

```bash
scantient check cors https://api.example.com
scantient check cors https://api.example.com --json
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Install Scantient CLI
        run: npm install -g @scantient/cli

      - name: Run security scan
        env:
          SCANTIENT_API_KEY: ${{ secrets.SCANTIENT_API_KEY }}
        run: scantient ci ${{ vars.PRODUCTION_URL }} --min-score 80

      # Optional: save JSON report as artifact
      - name: Save scan report
        if: always()
        env:
          SCANTIENT_API_KEY: ${{ secrets.SCANTIENT_API_KEY }}
        run: scantient scan ${{ vars.PRODUCTION_URL }} --json > scan-report.json

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-scan-report
          path: scan-report.json
```

### GitLab CI

```yaml
security-scan:
  stage: test
  image: node:20-alpine
  before_script:
    - npm install -g @scantient/cli
  script:
    - scantient ci $PRODUCTION_URL --min-score 80
  variables:
    SCANTIENT_API_KEY: $SCANTIENT_API_KEY
  allow_failure: false
  artifacts:
    when: always
    paths:
      - scan-report.json
    expire_in: 30 days
  after_script:
    - scantient scan $PRODUCTION_URL --json > scan-report.json || true
```

### Makefile / Shell Script

```bash
#!/bin/bash
# check-security.sh — run before deploy
set -e

URL="${1:-https://api.example.com}"
MIN_SCORE="${2:-80}"

echo "Running security scan on $URL..."
scantient ci "$URL" --min-score "$MIN_SCORE"

echo "✅ Security check passed"
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SCANTIENT_API_KEY` | Your Scantient API key. Get one at [scantient.com](https://scantient.com). |

---

## JSON Output (for Agents & Automation)

Use `--json` to get machine-readable output:

```bash
# Get just the score
scantient scan https://api.example.com --json | jq '.score'

# Get only critical findings
scantient scan https://api.example.com --json | jq '[.findings[] | select(.severity == "CRITICAL")]'

# Pipe to another tool
scantient scan https://api.example.com --json > report.json && \
  python analyze.py report.json
```

**JSON schema:**
```json
{
  "score": 72,
  "grade": "C",
  "findings": [
    {
      "title": "Missing HSTS Header",
      "severity": "CRITICAL",
      "description": "...",
      "recommendation": "..."
    }
  ]
}
```

---

## API Endpoints Used

| Command | Endpoint | Auth Required |
|---------|----------|---------------|
| `scan` (no key) | `POST /api/public/score` | No (5/hr rate limit) |
| `scan --key` | `POST /api/v1/scan` | Yes (API key) |
| `ci` | `POST /api/public/ci-scan` | Optional |
| `check *` | `POST /api/public/score` | No |

---

## Get an API Key

Visit [scantient.com](https://scantient.com) to create a free account and get your API key for higher rate limits and full scan results.

---

## License

MIT © [Scantient](https://scantient.com)
