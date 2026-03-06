# Developer Guide — SmartPromts

## Getting Started

### Prerequisites

- Node.js ≥ 20.0.0 (`node --version`)
- npm ≥ 10.0.0 (`npm --version`)
- Git

### Clone and install

```bash
git clone https://github.com/SMSDAO/SmartPromts.git
cd SmartPromts
npm install
```

### Environment setup

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

Minimum required variables for local development:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## GitHub Codespaces

This repository includes a Codespaces configuration in `.devcontainer/`.

Click **Code → Codespaces → New codespace** in GitHub — the environment is set up automatically:

1. Node 20 installed
2. `npm install` runs automatically
3. Dev server starts on port 3000

---

## Project Structure

See [`docs/architecture.md`](./architecture.md) for the full directory layout and data-flow diagrams.

---

## Adding a New API Route

1. Create `app/api/your-route/route.ts`
2. Add Zod schema for the request body
3. Call `requireAdmin()` if admin-only
4. Apply `rateLimit()` for user-facing routes
5. Return typed `NextResponse.json()` responses

Example pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

const Schema = z.object({ field: z.string().min(1) })

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`route:${session.user.id}`)
  if (!rl.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const body = await req.json()
  const data = Schema.parse(body)
  // ... handler logic
}
```

---

## Using the AI Service Layer

The `src/services/ai/` module provides a higher-level interface over `lib/openai.ts`:

```typescript
import { routeModel, optimizeWithFallback, checkAIRateLimit } from '@/src/services/ai'

// Select model for user tier
const model = routeModel('gpt-4o', userTier) // falls back if tier too low

// Optimize with automatic model routing
const result = await optimizeWithFallback({ prompt, userTier })

// Per-tier AI rate limit
const rl = checkAIRateLimit(userId, userTier)
```

---

## Code Style

- **TypeScript strict mode** — all code must pass `tsc --noEmit`
- **ESLint** — `npm run lint` must pass with zero errors
- **Tailwind CSS** — utility-first styling, no custom CSS unless necessary
- **Zod** — all external input (API bodies, env vars) must be validated with Zod schemas
- **No `any`** — use explicit types or `unknown` with type guards

---

## Linting and Type-checking

```bash
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `bash scripts/auto-config.sh` | Auto-configure environment |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes with descriptive messages
4. Open a pull request against `main`
5. Ensure CI passes (`build`, `lint`, `test`, `security` workflows)
