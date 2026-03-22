# @scantient/mcp-server

> Use Scantient security scanning directly from Claude, Cursor, OpenClaw, or any MCP-compatible AI client.

[![npm version](https://img.shields.io/npm/v/@scantient/mcp-server)](https://www.npmjs.com/package/@scantient/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What Is This?

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes Scantient's security scanning tools to AI assistants. Once configured, you can ask Claude or Cursor to:

- "Scan https://api.example.com for security issues"
- "Check the SSL certificate on my production API"
- "What are the CRITICAL findings for my app?"
- "Trigger a new scan for app ID xyz"

---

## Installation

```bash
npm install -g @scantient/mcp-server
```

Or run directly with npx (no install needed):

```bash
npx @scantient/mcp-server
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SCANTIENT_API_KEY` | Recommended | Your Scantient API key. Required for authenticated tools. Get one at [scantient.com](https://scantient.com). |

---

## Available Tools

| Tool | Auth Required | Description |
|------|--------------|-------------|
| `scan_url` | No | Quick scan any URL — no API key needed |
| `scan_authenticated` | Yes | Full scan with higher rate limits |
| `check_headers` | No | Check security headers only |
| `check_ssl` | No | Check SSL certificate and config |
| `list_apps` | Yes | List monitored apps with scores |
| `get_findings` | Yes | Get findings for an app, filtered by severity/status |
| `trigger_scan` | Yes | Trigger a fresh scan for a monitored app |

---

## Setup: Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "scantient": {
      "command": "npx",
      "args": ["-y", "@scantient/mcp-server"],
      "env": {
        "SCANTIENT_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see Scantient tools available in the tool panel.

**Test it:** Ask Claude: *"Scan https://api.example.com for security issues"*

---

## Setup: Cursor

Add to your Cursor MCP settings (`~/.cursor/mcp.json` or via Settings → MCP):

```json
{
  "mcpServers": {
    "scantient": {
      "command": "npx",
      "args": ["-y", "@scantient/mcp-server"],
      "env": {
        "SCANTIENT_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

After adding, open the Composer (Cmd+I) and ask:  
*"Check the security headers on https://myapi.com"*

---

## Setup: OpenClaw

Add to your OpenClaw config (`~/.openclaw/config.json`):

```json
{
  "mcp": {
    "servers": {
      "scantient": {
        "command": "npx",
        "args": ["-y", "@scantient/mcp-server"],
        "env": {
          "SCANTIENT_API_KEY": "sk_live_your_key_here"
        }
      }
    }
  }
}
```

Or reference the MCP endpoint directly (no local install needed):

```json
{
  "mcp": {
    "servers": {
      "scantient": {
        "url": "https://scantient.com/api/mcp",
        "auth": {
          "type": "bearer",
          "token": "sk_live_your_key_here"
        }
      }
    }
  }
}
```

---

## Setup: Run Locally for Development

```bash
# Clone the repo
git clone https://github.com/pschlie1/scantient.git
cd scantient/packages/mcp-server

# Install dependencies
npm install

# Run in dev mode (stdio)
SCANTIENT_API_KEY=sk_live_xxx npm run dev

# Or build and run
npm run build
SCANTIENT_API_KEY=sk_live_xxx node dist/index.js
```

---

## Example Prompts

Once connected to Claude or Cursor:

```
"Scan https://api.example.com for security vulnerabilities"
→ Uses scan_url (no auth needed)

"Run a full authenticated scan on https://api.example.com"
→ Uses scan_authenticated (requires API key)

"Check the security headers on https://mysite.com"
→ Uses check_headers

"What SSL issues does https://api.example.com have?"
→ Uses check_ssl

"List all my monitored apps and their security scores"
→ Uses list_apps

"Show me all CRITICAL findings for app id abc123"
→ Uses get_findings with severity filter

"Trigger a new scan for app id abc123"
→ Uses trigger_scan
```

---

## Get an API Key

Visit [scantient.com](https://scantient.com) to create an account and get your API key.

The `scan_url`, `check_headers`, and `check_ssl` tools work without an API key (rate-limited). All other tools require one.

---

## License

MIT © [Scantient](https://scantient.com)
