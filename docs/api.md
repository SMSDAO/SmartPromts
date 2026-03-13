# API Reference — SmartPromts

All API routes are Next.js App Router handlers under `/app/api/`.

---

## Authentication

All routes (except Stripe webhook) require a valid Supabase session cookie.

---

## Prompt Optimisation

### `POST /api/optimize`

Optimise a prompt using OpenAI GPT-4.

**Request body:**

```json
{
  "prompt": "string (1–10000 chars, required)",
  "model": "string (optional, e.g. gpt-4o)",
  "context": "string (optional)"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "original": "string",
    "optimized": "string",
    "improvements": ["string"],
    "tokensEstimate": 42
  },
  "usage": {
    "remaining": 8,
    "limit": 10,
    "resetAt": "2026-04-01T00:00:00Z",
    "tier": "free"
  }
}
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Invalid request body (Zod validation failure) |
| 401 | Not authenticated |
| 403 | Account banned or usage limit reached |
| 429 | Rate limit exceeded (10 req/min) |
| 500 | Internal error |

---

## Admin Routes

All admin routes require `subscription_tier = 'admin'`.

### `POST /api/admin/update-tier`

Update a user's subscription tier.

**Request body:**

```json
{ "userId": "uuid", "tier": "free|pro|lifetime|enterprise|admin" }
```

**Errors:** 403 if attempting to change own admin status.

---

### `POST /api/admin/ban`

Ban a user.

```json
{ "userId": "uuid" }
```

---

### `POST /api/admin/unban`

Unban a user.

```json
{ "userId": "uuid" }
```

---

### `POST /api/admin/reset-usage`

Reset a user's monthly usage counter.

```json
{ "userId": "uuid" }
```

---

## Stripe

### `POST /api/stripe/checkout`

Create a Stripe Checkout session.

```json
{ "priceId": "price_xxx" }
```

Returns `{ "url": "https://checkout.stripe.com/..." }`.

### `POST /api/stripe/webhook`

Stripe webhook handler (raw body, `Stripe-Signature` header required).

---

## Auth

### `POST /api/auth/signout`

Sign out the current user (clears session cookie).

---

## Rate Limits

| Route | Limit |
|-------|-------|
| `/api/optimize` | 10 req/min per user |
| Admin routes | 60 req/min per user |
