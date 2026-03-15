# Changelog

All notable changes to SmartPromts are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-03-14

### 🚀 Production Ready Release

First stable production release of SmartPromts — an enterprise-grade AI prompt optimization platform.

### Added

#### Core Application
- AI prompt optimization API supporting GPT-4, GPT-3.5-Turbo, Claude, and Gemini
- Magic-link (passwordless) authentication via Supabase
- Tier-based access control across 7 subscription tiers (see RBAC section below)
- Atomic usage tracking with race-condition-safe PostgreSQL RPC
- Rate limiting via Upstash Redis

#### Enterprise Access Control (RBAC)
Seven subscription tiers regulate usage limits, rate limits, and route access:

| Tier | Monthly usage | Rate limit (req/min) | Notes |
|------|--------------|----------------------|-------|
| `free` | 10 | 5 | Default for new sign-ups |
| `pro` | 1,000 | 30 | Stripe subscription |
| `enterprise` | Unlimited | 120 | Stripe subscription |
| `lifetime` | Unlimited | 60 | NFT Lifetime Pass holders |
| `developer` | Unlimited | 120 | Access to `/developer` dashboard and `/api/metrics` |
| `auditor` | 100 | 20 | Read-oriented role |
| `admin` | Unlimited | 300 | Full platform access + Admin Dashboard |

- Route-level protection via Next.js middleware for `/dashboard`, `/admin`, and `/developer`
- Admin panel exposes all 7 tiers for assignment to any user

#### Navigation & UI
- Tab-based navigation in Dashboard layout (Dashboard, Settings, Developer, Admin, Pricing)
- Role-aware navigation: Developer and Admin tabs visible only to authorized roles
- Neo-Glow visual style with soft cyan/blue gradients and animated glow effects
- Responsive layout for web and mobile

#### Dashboards
- **User Dashboard**: Prompt optimizer with usage tracking, model selector, upgrade CTA
- **Admin Dashboard**: User management, tier assignment (free/pro/enterprise/lifetime/developer/auditor/admin), ban/unban, usage reset
- **Developer Dashboard**: API reference table, environment variable status, runtime metrics quick-links

#### User Settings
- Settings page at `/dashboard/settings` with profile, notification preferences, appearance, and security info

#### API Endpoints
- `POST /api/optimize` — prompt optimization with usage enforcement
- `GET  /api/health` — public health check returning service status JSON
- `GET  /api/metrics` — authenticated metrics endpoint (admin/developer only)
- `POST /api/stripe/checkout` — Stripe checkout session creation
- `POST /api/stripe/webhook` — Stripe payment webhook handler
- `POST /api/verify-nft` — NFT Lifetime Pass ownership verification
- `POST /api/auth/signout` — session sign-out
- `POST /api/admin/ban|unban|update-tier|reset-usage` — admin user management

#### NFT Integration
- `SmartPromtsLifetimePass` ERC-721A contract on Base network
- Tiered pricing: 0.05 ETH (1–400), 0.08 ETH (401–700), 0.12 ETH (701–1000)
- 1,000 total supply cap with owner mint reserve (50)
- ReentrancyGuard protection and checks-effects-interactions pattern

#### Desktop App
- Tauri-based admin desktop wrapper in `admin-desktop/`
- Loads admin panel from hosted URL in production

#### PWA Support
- Web App Manifest at `/manifest.json`
- Mobile-optimized viewport meta tags
- Apple Web App capable configuration

#### Infrastructure
- Vercel deployment configuration with environment variable mapping
- GitHub Actions CI: lint, TypeScript, build (Node 20 & 22), tests, security scan
- `npm audit` dependency scanning (high/critical threshold)
- Gitleaks secret scanning workflow
- Dev Container configuration for Codespaces/VS Code

#### Documentation
- `/docs/architecture.md` — system architecture overview
- `/docs/deployment.md` — local setup and Vercel deployment guide
- `/docs/api.md` — API endpoint reference
- `/docs/developer.md` — extension and integration guide
- `/docs/security.md` — security practices and audit information
- `/docs/admin-desktop.md` — Tauri desktop app guide
- `contracts/README.md` — NFT contract deployment guide

### Security

- Supabase Row Level Security on all user data tables
- Middleware enforces session validation on all protected routes
- Input validation with Zod schemas on all API endpoints
- Secure HTTP headers via Next.js defaults
- Dependency vulnerability scanning via `npm audit` in CI
- Secret scanning via Gitleaks in CI

### Infrastructure

- Node.js 20+ required; tested on 20 and 22
- PostgreSQL via Supabase (hosted)
- Redis via Upstash (rate limiting)
- Stripe (subscription billing)
- OpenAI API (prompt optimization)
- Base network (NFT contract)

---

## [0.1.0] — Initial Development

- Project scaffolding with Next.js 15, Supabase, Tailwind CSS
- Basic prompt optimization flow
- Supabase magic-link authentication
- Landing page, login, pricing, and dashboard pages
- Admin panel with user management
- Stripe subscription integration
- NFT Lifetime Pass contract (ERC-721A on Base)
- Tauri desktop app wrapper
- CI/CD workflows

[1.0.0]: https://github.com/SMSDAO/SmartPromts/releases/tag/v1.0.0
[0.1.0]: https://github.com/SMSDAO/SmartPromts/commits/main
