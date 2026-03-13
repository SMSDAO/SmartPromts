# Architecture — SmartPromts

## Overview

SmartPromts is an AI-powered prompt optimisation platform built on Next.js 15 (App Router). It supports multiple user tiers, Stripe payments, Supabase authentication, and an NFT Lifetime Pass on the Base network.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Edge                              │
│                                                                  │
│  ┌────────────┐   ┌──────────────┐   ┌────────────────────────┐ │
│  │  Next.js   │   │  API Routes  │   │      Middleware         │ │
│  │  App Router│──▶│  /api/*      │   │  Auth + Rate limit     │ │
│  └────────────┘   └──────┬───────┘   └────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐  ┌───────────┐  ┌───────────┐
    │  Supabase   │  │  OpenAI   │  │  Stripe   │
    │  (Auth/DB)  │  │  GPT-4    │  │ Payments  │
    └─────────────┘  └───────────┘  └───────────┘
```

---

## Directory Structure

```
SmartPromts/
├── app/                        Next.js App Router
│   ├── admin/                  Admin dashboard (web)
│   ├── api/                    API routes
│   │   ├── admin/              Admin-only endpoints
│   │   ├── auth/               Auth endpoints
│   │   ├── optimize/           Prompt optimisation
│   │   └── stripe/             Stripe webhooks + checkout
│   ├── dashboard/              User dashboard
│   ├── login/                  Login page
│   ├── pricing/                Pricing page
│   └── page.tsx                Landing page
│
├── components/                 Shared React components
│   └── AdminActions.tsx        Admin user management UI
│
├── lib/                        Utility libraries
│   ├── auth.ts                 User provisioning + session helpers
│   ├── openai.ts               OpenAI client + optimizePrompt
│   ├── rate-limit.ts           In-memory rate limiter
│   ├── require-admin.ts        Admin guard utility
│   ├── stripe.ts               Stripe client
│   ├── supabase.ts             Server-side Supabase client
│   ├── supabase-client.ts      Client-side Supabase client
│   └── usage.ts                Usage tracking + limits
│
├── src/services/ai/            AI service layer
│   ├── index.ts                Public exports
│   ├── model-router.ts         Model selection by tier
│   ├── prompt-optimizer.ts     Enhanced optimiser (with routing)
│   ├── token-tracker.ts        Token estimation
│   ├── rate-limiter.ts         Per-tier AI rate limits
│   └── fallback.ts             Model fallback chains
│
├── config/
│   └── chains.ts               Web3 chain configuration (EVM + Solana)
│
├── contracts/
│   └── nft/                    Solidity NFT contract (Foundry)
│
├── admin-desktop/              ⚠️ Pending isolation to SMSDAO/SmartPromts-Admin
│   ├── src/                    React admin UI
│   └── src-tauri/              Tauri Rust shell
│
├── docs/                       Project documentation
├── tests/                      Unit + integration tests
└── scripts/                    Build automation scripts
```

---

## User Tiers

| Tier | Optimisations/month | Model Access |
|------|--------------------:|-------------|
| free | 10 | GPT-3.5 / GPT-4o-mini |
| pro | 1000 | GPT-4 Turbo / GPT-4o |
| lifetime | Unlimited | All models |
| enterprise | Unlimited | All models |
| admin | Unlimited | All models |

## Data Flow — Prompt Optimisation

```
User → POST /api/optimize
  → Auth check (Supabase session)
  → Ban check
  → Rate limit check (lib/rate-limit.ts)
  → Usage limit check (lib/usage.ts)
  → Zod schema validation
  → OpenAI call (lib/openai.ts)
  → Usage increment
  → Response with optimised prompt + usage stats
```

---

## Authentication

- **Provider**: Supabase Auth (email/password + OAuth)
- **Session**: Cookie-based via `@supabase/ssr`
- **Admin guard**: `lib/require-admin.ts` — checks `subscription_tier = 'admin'`
- **Middleware**: `middleware.ts` — protects `/admin/*` routes

---

## Database Schema (Supabase)

```sql
-- users table (usage tracking is stored directly on this table)
id                     uuid    primary key  (matches auth.users.id)
email                  text    not null
subscription_tier      text    default 'free'
stripe_customer_id     text    nullable
stripe_subscription_id text    nullable
usage_count            integer default 0
usage_reset_at         timestamptz
banned                 boolean default false
created_at             timestamptz
updated_at             timestamptz
```
