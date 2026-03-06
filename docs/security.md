# Security — SmartPromts

## Security Controls

### Authentication & Authorization

| Control | Implementation |
|---------|---------------|
| Session management | Supabase Auth cookie-based sessions via `@supabase/ssr` |
| Admin route protection | `middleware.ts` checks `subscription_tier = 'admin'` on all `/admin/*` routes |
| API admin guard | `lib/require-admin.ts` — `requireAdmin()` returns `NextResponse` on failure |
| Admin self-demotion prevention | `app/api/admin/update-tier/route.ts` — 403 if changing own admin status |

### Input Validation

All API request bodies are validated with **Zod** schemas before processing.

```typescript
// Example — optimize route
const OptimizeSchema = z.object({
  prompt: z.string().min(1).max(10000),
  model: z.string().optional(),
  context: z.string().optional(),
})
```

### Rate Limiting

In-memory rate limiter (`lib/rate-limit.ts`) applied per-user per endpoint:

| Endpoint | Limit |
|----------|-------|
| `POST /api/optimize` | 10 req/min |
| Admin endpoints | 60 req/min |

For production scale, replace the in-memory store with Redis (see `lib/rate-limit.ts` comments).

### Environment Variable Protection

- Server-only variables (`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`) are never exposed to the client
- `NEXT_PUBLIC_*` variables are intentionally client-safe
- Vercel deployment uses secrets (`@secret-name`) via `vercel.json`

### Stripe Webhook Security

Stripe webhook signature is verified on every request:

```typescript
stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
```

### XSS Protection

- React's JSX rendering escapes all interpolated content by default
- No use of `dangerouslySetInnerHTML`
- Content-Security-Policy headers can be added to `next.config.js`

### CSRF Protection

Next.js App Router API routes require `Content-Type: application/json` and verify Supabase session cookies which are `HttpOnly` and `SameSite=Lax`.

### Smart Contract Security

NFT contract (`contracts/nft/SmartPromtsLifetimePass.sol`):
- Uses `ReentrancyGuard` from OpenZeppelin
- Checks-effects-interactions pattern (state updates before external calls)
- Low-level `call()` for ETH transfers with return value check
- Max supply hard-capped at 1000 tokens
- Ownable with `renounceOwnership` disabled

---

## Security Checklist

- [x] Input validation (Zod) on all API routes
- [x] Authentication required on all protected routes
- [x] Rate limiting on AI endpoints
- [x] Admin self-demotion prevention
- [x] Server-only secrets not exposed to client
- [x] Stripe webhook signature verification
- [x] NFT contract ReentrancyGuard
- [x] TypeScript strict mode enabled
- [x] ESLint enabled
- [x] `npm audit` in CI (`security.yml`)
- [x] Secret scanning with Gitleaks in CI
- [ ] Redis-backed rate limiter (recommended for production)
- [ ] Content-Security-Policy headers
- [ ] JWT validation middleware for Web3 wallet auth
- [ ] SIWE (Sign-In with Ethereum) wallet authentication

---

## Reporting Vulnerabilities

Please report security vulnerabilities privately to the repository owner via GitHub's Security Advisory feature rather than opening a public issue.
