#!/usr/bin/env node
import { Command } from 'commander';

const BASE_URL = 'https://scantient.com';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Finding {
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  recommendation: string;
}

interface ScoreResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  findings: Finding[];
  url?: string;
  scannedAt?: string;
}

interface CiResult {
  passed: boolean;
  score: number;
  grade: string;
  minScore: number;
  findings?: Finding[];
  message?: string;
}

// ─── Colors & Formatting ──────────────────────────────────────────────────────

const reset = '\x1b[0m';
const bold = '\x1b[1m';
const dim = '\x1b[2m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const cyan = '\x1b[36m';
const white = '\x1b[37m';
const bgRed = '\x1b[41m';
const bgGreen = '\x1b[42m';
const bgYellow = '\x1b[43m';
const bgBlue = '\x1b[44m';

function colorize(text: string, ...codes: string[]): string {
  if (!process.stdout.isTTY) return text;
  return codes.join('') + text + reset;
}

const severityBadge = (severity: string): string => {
  switch (severity) {
    case 'CRITICAL': return '🔴 CRITICAL';
    case 'HIGH':     return '🟠 HIGH    ';
    case 'MEDIUM':   return '🟡 MEDIUM  ';
    case 'LOW':      return '🔵 LOW     ';
    default:         return `   ${severity}`;
  }
};

const gradeColor = (grade: string): string => {
  switch (grade) {
    case 'A': return colorize(` ${grade} `, bold, bgGreen, white);
    case 'B': return colorize(` ${grade} `, bold, bgGreen, white);
    case 'C': return colorize(` ${grade} `, bold, bgYellow, white);
    case 'D': return colorize(` ${grade} `, bold, bgRed, white);
    case 'F': return colorize(` ${grade} `, bold, bgRed, white);
    default:  return colorize(` ${grade} `, bold, bgBlue, white);
  }
};

const scoreColor = (score: number): string => {
  if (score >= 80) return colorize(String(score), bold, green);
  if (score >= 60) return colorize(String(score), bold, yellow);
  return colorize(String(score), bold, red);
};

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
  apiKey: string | undefined,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': '@scantient/cli/1.0.0',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
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
        // ignore parse errors
      }

      if (res.status === 401) {
        throw new Error(`Authentication failed: ${errMsg}. Check your API key (--key or SCANTIENT_API_KEY).`);
      }
      if (res.status === 429) {
        throw new Error(`Rate limit exceeded. Try again later or use an API key for higher limits.`);
      }
      throw new Error(`API error: ${errMsg}`);
    }

    return res.json() as Promise<T>;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s. Use --timeout to increase.`);
    }
    throw err;
  }
}

// ─── Output Formatters ────────────────────────────────────────────────────────

function printScanResult(result: ScoreResult, url: string): void {
  console.log();
  console.log(colorize('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', dim));
  console.log(colorize('  SCANTIENT SECURITY SCAN', bold, cyan));
  console.log(colorize('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', dim));
  console.log();
  console.log(`  ${colorize('URL:', bold)}    ${url}`);
  console.log(`  ${colorize('Score:', bold)}  ${scoreColor(result.score)} / 100`);
  console.log(`  ${colorize('Grade:', bold)}  ${gradeColor(result.grade)}`);
  console.log();

  const findings = result.findings ?? [];
  if (findings.length === 0) {
    console.log(colorize('  ✅ No security issues found!', green, bold));
  } else {
    const critical = findings.filter(f => f.severity === 'CRITICAL').length;
    const high     = findings.filter(f => f.severity === 'HIGH').length;
    const medium   = findings.filter(f => f.severity === 'MEDIUM').length;
    const low      = findings.filter(f => f.severity === 'LOW').length;

    console.log(colorize(`  Findings: ${findings.length} total`, bold));
    if (critical > 0) console.log(`    🔴 ${critical} Critical`);
    if (high > 0)     console.log(`    🟠 ${high} High`);
    if (medium > 0)   console.log(`    🟡 ${medium} Medium`);
    if (low > 0)      console.log(`    🔵 ${low} Low`);
    console.log();

    for (const finding of findings) {
      console.log(colorize('  ─────────────────────────────────────────', dim));
      console.log(`  ${severityBadge(finding.severity)}  ${colorize(finding.title, bold)}`);
      if (finding.description) {
        console.log(`  ${colorize('Description:', dim)} ${finding.description}`);
      }
      if (finding.recommendation) {
        console.log(`  ${colorize('Fix:', dim)}         ${colorize(finding.recommendation, green)}`);
      }
      console.log();
    }
  }

  console.log(colorize('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', dim));
  console.log();
}

function printFilteredFindings(result: ScoreResult, category: string, url: string): void {
  console.log();
  console.log(colorize(`━━━ ${category.toUpperCase()} CHECK: ${url} ━━━`, dim, bold));
  console.log();

  const keyword = category.toLowerCase();
  const relevant = (result.findings ?? []).filter(f => {
    const text = `${f.title} ${f.description}`.toLowerCase();
    return text.includes(keyword);
  });

  if (relevant.length === 0) {
    console.log(colorize(`  ✅ No ${category} issues found.`, green));
  } else {
    for (const f of relevant) {
      console.log(`  ${severityBadge(f.severity)}  ${colorize(f.title, bold)}`);
      if (f.description)    console.log(`  ${colorize('Detail:', dim)} ${f.description}`);
      if (f.recommendation) console.log(`  ${colorize('Fix:', dim)}    ${colorize(f.recommendation, green)}`);
      console.log();
    }
  }
  console.log(colorize('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', dim));
  console.log();
}

// ─── Shared Scan Logic ────────────────────────────────────────────────────────

async function runScan(
  url: string,
  opts: { key?: string; json?: boolean; timeout?: number }
): Promise<ScoreResult> {
  const apiKey = opts.key ?? process.env.SCANTIENT_API_KEY;
  const timeoutMs = (opts.timeout ?? 30) * 1000;

  const endpoint = apiKey ? '/api/v1/scan' : '/api/public/score';
  const body: Record<string, unknown> = { url };

  if (!opts.json) {
    process.stderr.write(colorize(`\n  ⏳ Scanning ${url}...\n`, dim));
  }

  const result = await apiPost<ScoreResult>(endpoint, body, apiKey, timeoutMs);
  return result;
}

// ─── CLI Definition ───────────────────────────────────────────────────────────

const program = new Command();

program
  .name('scantient')
  .description('Scantient CLI — scan any URL for API security vulnerabilities')
  .version('1.0.0')
  .addHelpText('after', `
Examples:
  $ scantient scan https://api.example.com
  $ scantient scan https://api.example.com --key sk_live_xxx
  $ scantient scan https://api.example.com --json | jq '.score'
  $ scantient ci https://api.example.com --min-score 80
  $ scantient check headers https://api.example.com
  $ scantient check ssl https://api.example.com
  $ scantient check cors https://api.example.com

Environment:
  SCANTIENT_API_KEY   Your Scantient API key (alternative to --key)
`);

// ── scan command ──────────────────────────────────────────────────────────────

program
  .command('scan <url>')
  .description('Scan a URL for security vulnerabilities')
  .option('-k, --key <apiKey>', 'Scantient API key (or set SCANTIENT_API_KEY)')
  .option('-j, --json', 'Output raw JSON (for piping/agents)')
  .option('-t, --timeout <seconds>', 'Request timeout in seconds', '30')
  .addHelpText('after', `
Examples:
  $ scantient scan https://api.example.com
  $ scantient scan https://api.example.com --key sk_live_xxx
  $ scantient scan https://api.example.com --json
`)
  .action(async (url: string, opts: { key?: string; json?: boolean; timeout?: string }) => {
    try {
      const result = await runScan(url, {
        key: opts.key,
        json: opts.json,
        timeout: opts.timeout ? parseInt(opts.timeout, 10) : 30,
      });

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printScanResult(result, url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (opts.json) {
        console.log(JSON.stringify({ error: msg }));
      } else {
        console.error(colorize(`\n  ❌ ${msg}\n`, red));
      }
      process.exit(1);
    }
  });

// ── ci command ────────────────────────────────────────────────────────────────

program
  .command('ci <url>')
  .description('CI/CD scan — exits 1 if score below threshold')
  .option('-k, --key <apiKey>', 'Scantient API key (or set SCANTIENT_API_KEY)')
  .option('-m, --min-score <score>', 'Minimum passing score (0-100)', '80')
  .option('-j, --json', 'Output raw JSON')
  .option('-t, --timeout <seconds>', 'Request timeout in seconds', '30')
  .addHelpText('after', `
Examples:
  $ scantient ci https://api.example.com --min-score 80
  $ scantient ci https://api.example.com --min-score 70 --key sk_live_xxx
  $ scantient ci https://api.example.com --json
`)
  .action(async (url: string, opts: { key?: string; minScore?: string; json?: boolean; timeout?: string }) => {
    const apiKey = opts.key ?? process.env.SCANTIENT_API_KEY;
    const timeoutMs = parseInt(opts.timeout ?? '30', 10) * 1000;
    const minScore = parseInt(opts.minScore ?? '80', 10);

    if (!opts.json) {
      process.stderr.write(colorize(`\n  ⏳ CI scan: ${url} (min score: ${minScore})...\n`, dim));
    }

    try {
      const result = await apiPost<CiResult>(
        '/api/public/ci-scan',
        { url, minScore },
        apiKey,
        timeoutMs
      );

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log();
        if (result.passed) {
          console.log(colorize(`  ✅ PASSED`, bold, green) + `  Score: ${scoreColor(result.score)} / 100  Grade: ${gradeColor(result.grade)}`);
          console.log(colorize(`  Minimum required: ${minScore}`, dim));
        } else {
          console.log(colorize(`  ❌ FAILED`, bold, red) + `  Score: ${scoreColor(result.score)} / 100  Grade: ${gradeColor(result.grade)}`);
          console.log(colorize(`  Minimum required: ${minScore}`, dim));
        }
        console.log();
      }

      process.exit(result.passed ? 0 : 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (opts.json) {
        console.log(JSON.stringify({ error: msg, passed: false }));
      } else {
        console.error(colorize(`\n  ❌ ${msg}\n`, red));
      }
      process.exit(1);
    }
  });

// ── check command ─────────────────────────────────────────────────────────────

const check = program
  .command('check')
  .description('Check specific security aspects of a URL');

(['headers', 'ssl', 'cors'] as const).forEach((category) => {
  check
    .command(`${category} <url>`)
    .description(`Check ${category} security for a URL`)
    .option('-k, --key <apiKey>', 'Scantient API key (or set SCANTIENT_API_KEY)')
    .option('-j, --json', 'Output raw JSON')
    .option('-t, --timeout <seconds>', 'Request timeout in seconds', '30')
    .action(async (url: string, opts: { key?: string; json?: boolean; timeout?: string }) => {
      try {
        const result = await runScan(url, {
          key: opts.key,
          json: opts.json,
          timeout: opts.timeout ? parseInt(opts.timeout, 10) : 30,
        });

        const keyword = category.toLowerCase();
        const relevant = (result.findings ?? []).filter(f => {
          const text = `${f.title} ${f.description}`.toLowerCase();
          return text.includes(keyword);
        });

        const filtered: ScoreResult = { ...result, findings: relevant };

        if (opts.json) {
          console.log(JSON.stringify(filtered, null, 2));
        } else {
          printFilteredFindings(result, category, url);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (opts.json) {
          console.log(JSON.stringify({ error: msg }));
        } else {
          console.error(colorize(`\n  ❌ ${msg}\n`, red));
        }
        process.exit(1);
      }
    });
});

program.parse(process.argv);
