# VibeSafe MVP

Outcome-focused production health + security monitoring for AI-generated apps.

## What this ships (customer value)
- Register internal/customer-facing app URLs in minutes
- Run external scans (no SDK) for:
  - functional accessibility baseline
  - exposed key signatures in JS bundles
  - missing security headers
  - client-side auth bypass patterns
- Generate actionable findings with a ready-to-paste AI fix prompt
- Portfolio dashboard for IT governance visibility
- Scheduled checks every 4 hours via Vercel Cron
- Weekly governance report endpoint

## Manifesto alignment
- **Outcome over activity:** every scan returns status + business-relevant risk finding + fix action
- **Agent-first workflow:** scan -> detect -> explain -> remediate prompt
- **API-first surface:** app registration, scan triggering, cron execution, dashboard, and weekly report all available via API routes
- **Data moat from day one:** every run/finding is persisted for trend and governance history

## Stack
- Next.js App Router + TypeScript strict mode
- Prisma + SQLite (initial DB for fast launch)
- Playwright for external monitoring checks
- Vercel Cron for continuous execution
- Vitest for critical test coverage
- GitHub Actions CI (lint, typecheck, test, build)

## Quick start
```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Open http://localhost:3000

## API endpoints
- `GET /api/apps` – list monitored apps
- `POST /api/apps` – register app
- `POST /api/scan/:id` – run immediate scan
- `GET /api/cron/run` – run due scans (requires `Authorization: Bearer $CRON_SECRET`)
- `GET /api/dashboard` – portfolio summary + recent runs
- `GET /api/reports/weekly` – weekly governance snapshot (requires cron auth)

## CI/CD
GitHub Actions workflow: `.github/workflows/ci.yml`
- npm ci
- prisma generate
- lint
- typecheck
- tests w/ coverage
- production build

## Production setup notes
- Set `CRON_SECRET` in Vercel env
- Add Vercel cron schedules from `vercel.json`
- (Next step) wire Resend for outbound alerts and weekly digest emails
- (Next step) migrate DB to Postgres/Supabase when pilot load grows
