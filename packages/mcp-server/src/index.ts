#!/usr/bin/env node
/**
 * Scantient MCP Server
 *
 * Exposes Scantient security scanning as MCP tools for use with
 * Claude Desktop, Cursor, OpenClaw, or any MCP-compatible client.
 *
 * Usage:
 *   SCANTIENT_API_KEY=sk_live_xxx npx @scantient/mcp-server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

const BASE_URL = 'https://scantient.com';
const API_KEY = process.env.SCANTIENT_API_KEY;
const DEFAULT_TIMEOUT_MS = 60_000;

// ─── API Helper ───────────────────────────────────────────────────────────────

async function scantientPost<T>(
  path: string,
  body: Record<string, unknown>,
  requiresAuth = false
): Promise<T> {
  if (requiresAuth && !API_KEY) {
    throw new Error(
      'This tool requires a Scantient API key. Set SCANTIENT_API_KEY environment variable.'
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': '@scantient/mcp-server/1.0.0',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errBody = await res.json() as { error?: string; message?: string };
        errMsg = errBody.error ?? errBody.message ?? errMsg;
      } catch {
        // ignore
      }
      if (res.status === 401) {
        throw new Error(
          `Authentication failed: Invalid or missing API key. Set SCANTIENT_API_KEY and restart the MCP server.`
        );
      }
      if (res.status === 429) {
        throw new Error(
          `Rate limit exceeded. Use an API key (SCANTIENT_API_KEY) for higher limits, or wait before retrying.`
        );
      }
      throw new Error(`Scantient API error: ${errMsg}`);
    }

    return res.json() as Promise<T>;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s.`);
    }
    throw err;
  }
}

async function scantientGet<T>(path: string, requiresAuth = true): Promise<T> {
  if (requiresAuth && !API_KEY) {
    throw new Error(
      'This tool requires a Scantient API key. Set SCANTIENT_API_KEY environment variable.'
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': '@scantient/mcp-server/1.0.0',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errBody = await res.json() as { error?: string; message?: string };
        errMsg = errBody.error ?? errBody.message ?? errMsg;
      } catch {
        // ignore
      }
      throw new Error(`Scantient API error: ${errMsg}`);
    }

    return res.json() as Promise<T>;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s.`);
    }
    throw err;
  }
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const tools: Tool[] = [
  {
    name: 'scan_url',
    description:
      'Scan any public URL for security vulnerabilities. Returns a security score (0-100), ' +
      'grade (A-F), and a list of findings with severity levels and fix recommendations. ' +
      'No authentication required — use this for quick, one-off scans. ' +
      'Rate limited to 5 requests/hour per IP.',
    inputSchema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description: 'The URL to scan (e.g. https://api.example.com)',
        },
      },
    },
  },
  {
    name: 'scan_authenticated',
    description:
      'Run a full security scan with your API key for higher rate limits and more detailed results. ' +
      'Can scan by URL or by monitored app ID. Requires SCANTIENT_API_KEY environment variable.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL to scan (use this OR appId, not both)',
        },
        appId: {
          type: 'string',
          description: 'Monitored app ID to scan (use this OR url, not both)',
        },
      },
    },
  },
  {
    name: 'check_headers',
    description:
      'Check security headers on a URL: Content-Security-Policy, HSTS, X-Frame-Options, ' +
      'X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and more. ' +
      'Returns findings specific to missing or misconfigured headers.',
    inputSchema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description: 'The URL to check headers on',
        },
      },
    },
  },
  {
    name: 'check_ssl',
    description:
      'Check SSL/TLS certificate and configuration for a URL: certificate validity, ' +
      'expiry date, chain issues, weak cipher suites, and protocol versions.',
    inputSchema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description: 'The URL to check SSL for (must be https://)',
        },
      },
    },
  },
  {
    name: 'list_apps',
    description:
      'List all monitored applications in your Scantient account with their current security scores. ' +
      'Requires SCANTIENT_API_KEY.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_findings',
    description:
      'Get security findings for a monitored app, optionally filtered by status or severity. ' +
      'Useful for tracking which issues are open, in-progress, or resolved. ' +
      'Requires SCANTIENT_API_KEY.',
    inputSchema: {
      type: 'object',
      required: ['appId'],
      properties: {
        appId: {
          type: 'string',
          description: 'The monitored app ID to get findings for',
        },
        severity: {
          type: 'string',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          description: 'Filter by severity level (optional)',
        },
        status: {
          type: 'string',
          enum: ['open', 'in_progress', 'resolved', 'ignored'],
          description: 'Filter by finding status (optional)',
        },
      },
    },
  },
  {
    name: 'trigger_scan',
    description:
      'Trigger a new security scan for a monitored application. ' +
      'Use this when you want to get fresh results after making changes. ' +
      'Requires SCANTIENT_API_KEY.',
    inputSchema: {
      type: 'object',
      required: ['appId'],
      properties: {
        appId: {
          type: 'string',
          description: 'The monitored app ID to scan',
        },
      },
    },
  },
];

// ─── Tool Handlers ────────────────────────────────────────────────────────────

type ToolArgs = Record<string, unknown>;

async function handleTool(name: string, args: ToolArgs): Promise<unknown> {
  switch (name) {
    case 'scan_url': {
      const url = args.url as string;
      if (!url) throw new Error('url is required');
      return await scantientPost('/api/public/score', { url });
    }

    case 'scan_authenticated': {
      const url = args.url as string | undefined;
      const appId = args.appId as string | undefined;
      if (!url && !appId) throw new Error('Either url or appId is required');
      const body: Record<string, unknown> = {};
      if (url) body.url = url;
      if (appId) body.appId = appId;
      return await scantientPost('/api/v1/scan', body, true);
    }

    case 'check_headers': {
      const url = args.url as string;
      if (!url) throw new Error('url is required');
      const result = await scantientPost<{
        findings?: Array<{ title: string; description: string; severity: string; recommendation: string }>;
        score?: number;
        grade?: string;
      }>('/api/public/score', { url });
      // Filter findings to header-related ones
      const findings = (result.findings ?? []).filter(f => {
        const text = `${f.title} ${f.description}`.toLowerCase();
        return (
          text.includes('header') ||
          text.includes('hsts') ||
          text.includes('csp') ||
          text.includes('content-security') ||
          text.includes('x-frame') ||
          text.includes('referrer') ||
          text.includes('permissions-policy')
        );
      });
      return { ...result, findings, category: 'headers' };
    }

    case 'check_ssl': {
      const url = args.url as string;
      if (!url) throw new Error('url is required');
      const result = await scantientPost<{
        findings?: Array<{ title: string; description: string; severity: string; recommendation: string }>;
        score?: number;
        grade?: string;
      }>('/api/public/score', { url });
      const findings = (result.findings ?? []).filter(f => {
        const text = `${f.title} ${f.description}`.toLowerCase();
        return (
          text.includes('ssl') ||
          text.includes('tls') ||
          text.includes('certificate') ||
          text.includes('cipher') ||
          text.includes('https')
        );
      });
      return { ...result, findings, category: 'ssl' };
    }

    case 'list_apps': {
      return await scantientGet('/api/v1/apps', true);
    }

    case 'get_findings': {
      const appId = args.appId as string;
      if (!appId) throw new Error('appId is required');
      const params = new URLSearchParams({ appId });
      if (args.severity) params.set('severity', args.severity as string);
      if (args.status)   params.set('status', args.status as string);
      return await scantientGet(`/api/v1/findings?${params.toString()}`, true);
    }

    case 'trigger_scan': {
      const appId = args.appId as string;
      if (!appId) throw new Error('appId is required');
      return await scantientPost('/api/v1/scan', { appId }, true);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── MCP Server Setup ─────────────────────────────────────────────────────────

const server = new Server(
  {
    name: 'scantient',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleTool(name, (args ?? {}) as ToolArgs);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // MCP servers communicate via stdio; log to stderr only
  process.stderr.write('Scantient MCP server running on stdio\n');
  if (!API_KEY) {
    process.stderr.write(
      'Warning: SCANTIENT_API_KEY not set. Authenticated tools will not work.\n'
    );
  }
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
