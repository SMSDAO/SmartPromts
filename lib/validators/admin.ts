/**
 * Zod schemas for admin-only API operations.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

export const UpdateUserTierSchema = z.object({
  userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
  tier: z.enum(['free', 'pro', 'enterprise', 'lifetime', 'admin', 'developer', 'auditor'], {
    errorMap: () => ({
      message:
        'tier must be one of: free, pro, enterprise, lifetime, admin, developer, auditor',
    }),
  }),
})

export type UpdateUserTier = z.infer<typeof UpdateUserTierSchema>

export const BanUserSchema = z.object({
  userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
  /** When true the account is banned; false restores access */
  banned: z.boolean(),
  /** Optional reason stored for audit purposes */
  reason: z.string().max(500).optional(),
})

export type BanUser = z.infer<typeof BanUserSchema>

// ---------------------------------------------------------------------------
// Usage management
// ---------------------------------------------------------------------------

export const ResetUsageSchema = z.object({
  userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
})

export type ResetUsage = z.infer<typeof ResetUsageSchema>

// ---------------------------------------------------------------------------
// System operations
// ---------------------------------------------------------------------------

export const SystemActionSchema = z.object({
  action: z.enum(['flush-cache', 'reindex', 'health-recheck'], {
    errorMap: () => ({
      message: 'action must be one of: flush-cache, reindex, health-recheck',
    }),
  }),
  /** Optional target scope (e.g. a specific user or model) */
  target: z.string().max(255).optional(),
})

export type SystemAction = z.infer<typeof SystemActionSchema>
