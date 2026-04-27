# Production Deployment Guide

This document covers everything required to deploy SmartPromts to a production environment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Health Check Monitoring](#health-check-monitoring)
4. [Logging Configuration](#logging-configuration)
5. [Error Tracking](#error-tracking)
6. [Performance Monitoring](#performance-monitoring)
7. [Deployment (Vercel)](#deployment-vercel)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Security Hardening](#security-hardening)
10. [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

| Requirement | Minimum version |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| Supabase project | — |
| OpenAI API key | — |
| Stripe account | — |
| Upstash Redis (recommended) | — |

---

## Environment Variables

All environment variables are validated at startup using Zod (`lib/config.ts`). The application will **fail to start** if a required variable is absent or malformed.

Copy `.env.example` to `.env.local` and fill in every value before running the app:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `OPENAI_API_KEY` | OpenAI API key |

### Strongly Recommended

| Variable | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for admin operations |
| `STRIPE_SECRET_KEY` | Stripe server-side secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID_PRO` | Stripe Price ID for the Pro plan |
| `STRIPE_PRICE_ID_ENTERPRISE` | Stripe Price ID for the Enterprise plan |
| `NEXT_PUBLIC_APP_URL` | Canonical public URL of the app |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

### Optional Variables

| Variable | Description |
|---|---|
| `STRIPE_PRICE_ID_FREE` | Stripe Price ID for the Free plan |
| `STRIPE_PRICE_ID_LIFETIME` | Stripe Price ID for Lifetime access |
| `NFT_CONTRACT_ADDRESS` | NFT smart-contract address (Base) |
| `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` | Public NFT contract address |
| `BASE_CHAIN_ID` | Base chain ID (default: 8453) |
| `BASE_RPC_URL` | Base network RPC URL |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect cloud project ID |

---

## Health Check Monitoring

The `/api/health` endpoint provides a lightweight liveness probe:

```
GET /api/health
```

**Sample response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-04-24T13:00:00.000Z",
  "env": "production",
  "latency_ms": 2
}
```

### Setting Up Uptime Monitoring

Configure your uptime monitoring service (UptimeRobot, Better Uptime, etc.) to poll `GET /api/health` every 60 seconds and alert when the HTTP status is not `200`.

**Vercel cron (optional):** You can also add a cron job in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Logging Configuration

SmartPromts uses [Pino](https://getpino.io/) for structured, JSON-formatted production logging (`lib/logger.ts`).

### Log Levels

| Environment | Level |
|---|---|
| `production` | `info` |
| `development` | `debug` |
| `test` | `silent` |

### Structured Log Fields

Every log entry includes:
- `env` – Node environment
- `version` – App version
- `requestId` – Per-request correlation ID (from `X-Request-Id` header)
- `userId` – Authenticated user ID (never email or PII)

Sensitive fields are automatically redacted: `password`, `token`, `apiKey`, `secret`, `authorization`, `cookie`.

### Viewing Logs

**Vercel:** Navigate to **Project → Logs** in the Vercel dashboard. Use the log filter to search by `requestId`.

**Local development (pretty-print):**

```bash
npm run dev
# Pino-pretty automatically colorises output
```

**Production JSON stream:**

```bash
NODE_ENV=production node server.js | npx pino-pretty
```

---

## Error Tracking

Error tracking is pre-wired via `lib/error-tracking.ts`. The default implementation uses `console.error` / `console.warn` as a no-op placeholder — errors are logged to stdout but not forwarded to an external service. To integrate a real error monitoring service:

### Sentry Integration Example

1. Install the SDK:

   ```bash
   npm install @sentry/nextjs
   ```

2. Replace the body of `captureException` in `lib/error-tracking.ts`:

   ```typescript
   import * as Sentry from '@sentry/nextjs'

   export function captureException(err: unknown, context?: ErrorContext): void {
     Sentry.withScope((scope) => {
       if (context?.userId) scope.setUser({ id: context.userId })
       if (context?.requestId) scope.setTag('requestId', context.requestId)
       Sentry.captureException(err)
     })
   }
   ```

3. Add your DSN to `.env.local`:

   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   ```

### Error Boundaries

The application includes two Next.js App Router error boundaries:

- `app/global-error.tsx` – Root-level boundary. Catches errors in any route.
- `app/(user)/dashboard/error.tsx` – Dashboard-specific boundary with contextual messaging.

Both boundaries forward errors to `captureException` and provide a **Try again** button that triggers a re-render without a full page reload.

The reusable `components/ErrorBoundary.tsx` class component is available for wrapping individual client-side sub-trees.

---

## Performance Monitoring

Performance utilities are provided in `lib/performance.ts`.

### API Latency

Wrap expensive operations with `timed()`:

```typescript
import { timed } from '@/lib/performance'

const result = await timed('openai.optimize', () => optimizePrompt(options), { userId })
```

### Web Vitals

Export `reportWebVitals` from your layout to capture Core Web Vitals:

```typescript
// app/layout.tsx
import type { NextWebVitalsMetric } from 'next/app'
import { reportVital } from '@/lib/performance'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  reportVital(metric as Parameters<typeof reportVital>[0])
}
```

---

## Deployment (Vercel)

SmartPromts is optimised for Vercel's serverless infrastructure.

### Steps

1. **Import the repository** into Vercel.
2. **Set environment variables** in **Project → Settings → Environment Variables**.
3. **Deploy** – Vercel will run `npm run build` automatically.

### Vercel Configuration

`vercel.json` is already present in the repository with function memory and region settings.

### Build Command

```bash
npm run build
```

### Output Directory

`.next` (automatically detected by Vercel).

---

## CI/CD Pipeline

The repository ships with the following GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Every push / PR | Lint + test + type-check |
| `build.yml` | Every push / PR | Full Next.js build |
| `production-check.yml` | Push/PR to `main` | Pre-deployment validation |
| `security.yml` | Schedule + PR | Dependency audit |
| `deploy.yml` | Push to `main` | Deploy to Vercel |

### Production Pre-flight (`production-check.yml`)

Runs four jobs in parallel before merging to `main`:

1. **Validate environment schema** – TypeScript compile check
2. **Production build** – Full `next build` with placeholder secrets
3. **Unit tests** – Vitest test suite
4. **Health check smoke test** – Verifies the `/api/health` route export

---

## Security Hardening

The following security controls are active in production:

| Control | Implementation |
|---|---|
| Security HTTP headers | `next.config.js` – `Content-Security-Policy`, `HSTS`, `X-Frame-Options`, etc. |
| Rate limiting | `lib/rate-limit.ts` – Upstash Redis sliding window (in-memory fallback) |
| Input validation | Zod schemas on all API routes (`lib/validators/`) |
| Env validation | Fail-fast startup check (`lib/config.ts`, `lib/env.ts`) |
| Secret redaction | Pino logger redacts sensitive fields (`lib/logger.ts`) |
| RBAC | Tier-based access control on admin/developer routes (`lib/rbac.ts`) |

---

## Rollback Procedure

### Vercel

1. Go to **Project → Deployments** in the Vercel dashboard.
2. Find the last known-good deployment.
3. Click **⋮ → Promote to Production**.

### Git

```bash
# Tag the last known-good commit
git tag v1.x.x <commit-sha>
git push origin v1.x.x

# Create a revert PR
git revert --no-commit <bad-commit>..HEAD
git commit -m "revert: roll back to v1.x.x"
git push origin fix/rollback
# Open PR → merge → redeploy
```
