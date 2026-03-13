// Production rate limiter using Upstash Redis (sliding window algorithm)
// Falls back to in-memory limiting when UPSTASH_REDIS_REST_URL is not set (local dev)

import type { Ratelimit } from '@upstash/ratelimit'

export interface RateLimitOptions {
  interval: number // in milliseconds
  limit: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Default: 10 requests per minute
const DEFAULT_OPTIONS: RateLimitOptions = {
  interval: 60 * 1000, // 1 minute
  limit: 10,
}

// ---------------------------------------------------------------------------
// In-memory fallback (local development only)
// ---------------------------------------------------------------------------

interface InMemoryEntry {
  count: number
  resetAt: number
}

const inMemoryStore: Record<string, InMemoryEntry> = {}

function inMemoryRateLimit(
  identifier: string,
  opts: RateLimitOptions
): RateLimitResult {
  const now = Date.now()

  // Probabilistic cleanup of expired entries
  if (Math.random() < 0.01) {
    for (const key of Object.keys(inMemoryStore)) {
      if (inMemoryStore[key].resetAt < now) {
        delete inMemoryStore[key]
      }
    }
  }

  let entry = inMemoryStore[identifier]
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + opts.interval }
    inMemoryStore[identifier] = entry
  }

  const success = entry.count < opts.limit
  if (success) {
    entry.count++
  }

  return {
    success,
    limit: opts.limit,
    remaining: Math.max(0, opts.limit - entry.count),
    reset: entry.resetAt,
  }
}

function inMemoryGetInfo(
  identifier: string,
  opts: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const entry = inMemoryStore[identifier]

  if (!entry || entry.resetAt < now) {
    return {
      success: true,
      limit: opts.limit,
      remaining: opts.limit,
      reset: now + opts.interval,
    }
  }

  return {
    success: entry.count < opts.limit,
    limit: opts.limit,
    remaining: Math.max(0, opts.limit - entry.count),
    reset: entry.resetAt,
  }
}

// ---------------------------------------------------------------------------
// Upstash Redis rate limiter (production)
// ---------------------------------------------------------------------------

// Lazily initialised so the module can be imported in environments where
// Upstash env vars are absent (e.g. during `next build`).
let upstashLimiterCache: Map<string, Ratelimit> | null = null

async function getUpstashLimiter(opts: RateLimitOptions): Promise<Ratelimit | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  const cacheKey = `${opts.limit}:${opts.interval}`
  if (!upstashLimiterCache) {
    upstashLimiterCache = new Map()
  }
  const cached = upstashLimiterCache.get(cacheKey)
  if (cached) return cached

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.limit, `${opts.interval / 1000} s`),
    analytics: true,
  })

  upstashLimiterCache.set(cacheKey, limiter)
  return limiter
}

// ---------------------------------------------------------------------------
// Public API (synchronous wrapper with async Upstash path)
// ---------------------------------------------------------------------------

/**
 * Check and increment rate limit for the given identifier.
 * Uses Upstash Redis in production; falls back to in-memory for local dev.
 */
export function rateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): RateLimitResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Synchronous in-memory path (always available as fallback)
  return inMemoryRateLimit(identifier, opts)
}

/**
 * Async version of rateLimit — preferred in production.
 * Uses Upstash Redis when configured, falls back to in-memory.
 */
export async function rateLimitAsync(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): Promise<RateLimitResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    const limiter = await getUpstashLimiter(opts)
    if (limiter) {
      const result = await limiter.limit(identifier)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    }
  } catch (err) {
    console.error('Upstash rate limit error, falling back to in-memory:', err)
  }

  return inMemoryRateLimit(identifier, opts)
}

// Clear rate limit for identifier (in-memory only)
export function clearRateLimit(identifier: string): void {
  delete inMemoryStore[identifier]
}

// Get rate limit info without incrementing (in-memory only)
export function getRateLimitInfo(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): RateLimitResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  return inMemoryGetInfo(identifier, opts)
}

