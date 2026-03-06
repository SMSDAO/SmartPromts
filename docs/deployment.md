# Deployment Guide — SmartPromts

## Prerequisites

- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- Supabase project
- OpenAI API key
- Stripe account
- Vercel account

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID_LIFETIME` | Stripe price ID for lifetime tier |
| `NEXT_PUBLIC_APP_URL` | Full app URL (e.g. `https://smartpromts.com`) |
| `NFT_CONTRACT_ADDRESS` | Deployed NFT contract address (Base) |
| `BASE_RPC_URL` | Base network RPC URL |
| `ADMIN_EMAIL` | Email of the initial admin user |

---

## Local Development

```bash
npm install
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

## Vercel Deployment

### 1. Create Vercel project

```bash
npx vercel
```

### 2. Add environment variables

In the Vercel dashboard → Settings → Environment Variables, add each variable from `.env.example`.

For sensitive values, use Vercel secrets:

```bash
vercel secrets add openai-api-key sk-...
```

Then reference them in `vercel.json`:

```json
"OPENAI_API_KEY": "@openai-api-key"
```

### 3. Deploy

```bash
git push origin main
# Vercel auto-deploys on push to main
```

Or manually:

```bash
npx vercel --prod
```

---

## Supabase Setup

### 1. Create tables

Run the following SQL in the Supabase SQL editor:

```sql
-- Users table
create table if not exists public.users (
  id uuid primary key references auth.users(id),
  email text not null,
  subscription_tier text not null default 'free',
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Usage table
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  month text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, month)
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.usage enable row level security;

-- Policies
create policy "Users can read own record" on public.users
  for select using (auth.uid() = id);

create policy "Service role can do everything on users" on public.users
  using (true) with check (true);

create policy "Service role can do everything on usage" on public.usage
  using (true) with check (true);
```

### 2. Enable Auth providers

In Supabase → Authentication → Providers, enable Email.

---

## Stripe Setup

1. Create products and prices in Stripe Dashboard
2. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
3. Add events: `checkout.session.completed`, `customer.subscription.updated`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## CI/CD

GitHub Actions workflows handle:

- **`build.yml`** — Install, type-check, build on PR and push
- **`lint.yml`** — ESLint + TypeScript check
- **`test.yml`** — Unit and integration tests
- **`security.yml`** — `npm audit` + secret scanning (weekly + on PR)
- **`deploy.yml`** — Vercel production deploy on merge to `main`

---

## Admin System

The web admin panel is available at `/admin` (requires `subscription_tier = 'admin'`).

Set the initial admin:

```sql
update public.users set subscription_tier = 'admin' where email = 'admin@yourdomain.com';
```

Or set `ADMIN_EMAIL` in your environment and the system will automatically assign admin tier on first login.

---

## NFT Contract (Base Network)

See [`contracts/README.md`](../contracts/README.md) for deployment instructions.
