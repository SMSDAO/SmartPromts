/**
 * AI-specific rate limiter — wraps the global rate limiter with
 * per-model and per-tier limits.
 */

import { rateLimit, type RateLimitResult } from '@/lib/rate-limit'

export type AIRateLimitResult = RateLimitResult

/** Per-tier request limits per minute */
const TIER_LIMITS: Record<string, number> = {
  free: 5,
  pro: 30,
  lifetime: 60,
  enterprise: 120,
  admin: 300,
}

/**
 * Check the AI rate limit for a user, taking their subscription tier into
 * account to allow higher-tier users more requests per minute.
 */
export function checkAIRateLimit(
  userId: string,
  userTier: string
): AIRateLimitResult {
  const limit = TIER_LIMITS[userTier] ?? TIER_LIMITS.free
  return rateLimit(`ai:${userId}`, { interval: 60 * 1000, limit })
}
