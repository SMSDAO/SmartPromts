# RBAC Architecture

SmartPromts uses a Role-Based Access Control (RBAC) system built on top of Supabase Auth. Roles are derived server-side from the `subscription_tier` stored in the `users` table — the client never supplies a role directly, preventing privilege spoofing.

---

## Role Hierarchy

| Role | Tiers | Access Level |
|------|-------|-------------|
| `admin` | `admin` | Full platform access: user management, analytics, billing, audit logs, all developer features |
| `developer` | `developer` | Developer tools: prompt builder, datasets, experiments, benchmarks, tuning, agents |
| `user` | `free`, `pro`, `enterprise`, `lifetime`, `auditor` | End-user features: dashboard, marketplace, saved prompts, subscriptions |

---

## Implementation

### Core module (`lib/rbac.ts`)

```ts
import { getRole, hasRole, enforceRole, withRole } from '@/lib/rbac'
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `getRole` | `(tier: SubscriptionTier) → Role` | Derive a Role from a DB tier — server-side only |
| `hasRole` | `(user, roles[]) → boolean` | Check if user holds ≥1 of the given roles |
| `enforceRole` | `(handler, roles[]) → handler` | Wrap an API route handler with auth + RBAC |
| `withRole` | `(roles[]) → (handler) → handler` | Curried version of `enforceRole` for composability |

### Audit logging (`lib/audit.ts`)

```ts
import { logAuditEvent } from '@/lib/audit'

await logAuditEvent({
  actor_id: user.id,
  action: 'user.role_changed',
  resource_type: 'user',
  resource_id: targetUserId,
  metadata: { from: 'free', to: 'pro' },
})
```

Audit events are stored in the `audit_logs` Supabase collection. Failures are non-fatal.

### Frontend guard (`components/guards/RoleGuard.tsx`)

```tsx
<RoleGuard allowedRoles={['admin']} userTier={user.subscription_tier} redirectTo="/dashboard">
  <AdminPanel />
</RoleGuard>
```

> **Important:** The `RoleGuard` is a defence-in-depth layer only. Real enforcement happens on the server via middleware and API route guards.

---

## Route Protection

### Middleware (`middleware.ts`)

The Next.js middleware intercepts all requests to protected routes and redirects unauthenticated users to `/login`. Admin/developer routes additionally check the `subscription_tier` from Supabase.

Protected paths:
- `/dashboard/*` — requires authentication
- `/admin/*` — requires `admin` tier
- `/developer/*` — requires `admin` or `developer` tier

### Route Group Layouts

Pages are organized into route groups that enforce RBAC at the layout level:

| Route Group | Layout | Enforced Role |
|-------------|--------|---------------|
| `app/(admin)/` | Admin Neo Glow sidebar | `admin` |
| `app/(dev)/` | Developer Neo Glow sidebar | `admin` OR `developer` |
| `app/(user)/` | User Neo Glow sidebar | any authenticated user |

### API Routes

All API routes that modify data or access privileged information require authentication. Use `enforceRole` or `requireAdmin` from `lib/require-admin.ts` to protect handlers.

---

## Security Properties

1. **Server-side role resolution** — Roles are always derived from the DB; client claims are ignored.
2. **Anti-spoofing** — The `enforceRole` helper uses the Supabase service role key to fetch the tier from DB directly.
3. **Defence in depth** — Three layers: middleware → layout → API handler.
4. **Audit trail** — Admin and developer actions are written to `audit_logs`.
5. **Least privilege** — Each role only grants the minimum access needed.

---

## Adding a Protected Endpoint

```ts
// app/api/my-endpoint/route.ts
import { withRole } from '@/lib/rbac'

export const POST = withRole(['admin', 'developer'])(async (req, user) => {
  // user.id and user.subscription_tier are available here
  // RBAC already verified before this code runs
  return NextResponse.json({ ok: true })
})
```
