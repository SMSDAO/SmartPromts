/**
 * Zod schemas for the POST /api/optimize endpoint.
 *
 * Centralising schemas here allows:
 *  - Reuse across unit tests and the route handler
 *  - Type inference for both the request body and response shape
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export const OptimizeRequestSchema = z.object({
  /** The prompt text to be optimised – must be non-empty and ≤ 10,000 chars */
  prompt: z
    .string()
    .min(1, { message: 'prompt must not be empty' })
    .max(10_000, { message: 'prompt must be at most 10,000 characters' }),

  /** Target model identifier (e.g. "gpt-4", "claude-3-opus") */
  model: z.string().min(1).max(100).optional(),

  /** Optional additional context that guides the optimisation */
  context: z
    .string()
    .max(5_000, { message: 'context must be at most 5,000 characters' })
    .optional(),
})

export type OptimizeRequest = z.infer<typeof OptimizeRequestSchema>

// ---------------------------------------------------------------------------
// Response
// ---------------------------------------------------------------------------

export const OptimizeResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    original: z.string(),
    optimized: z.string(),
    improvements: z.array(z.string()),
    tokensEstimate: z.number().int().nonnegative(),
  }),
  usage: z.object({
    remaining: z.number().int(),
    limit: z.number().int(),
    resetAt: z.string().optional(),
    tier: z.string(),
  }),
})

export type OptimizeResponse = z.infer<typeof OptimizeResponseSchema>
