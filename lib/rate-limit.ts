// Simple in-memory rate limiter
// For production, consider using Redis or similar distributed cache
// Note: The probabilistic cleanup (1% chance) is simple but not ideal for high-scale production.
// For production deployments, use Redis with TTL or a scheduled cleanup job.

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

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

export function rateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): RateLimitResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const now = Date.now()

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    Object.keys(store).forEach((key) => {
      if (store[key].resetAt < now) {
        delete store[key]
      }
    })
  }

  // Get or create entry
  let entry = store[identifier]

  if (!entry || entry.resetAt < now) {
    // Create new entry
    entry = {
      count: 0,
      resetAt: now + opts.interval,
    }
    store[identifier] = entry
  }

  // Check limit
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

// Clear rate limit for identifier
export function clearRateLimit(identifier: string): void {
  delete store[identifier]
}

// Get rate limit info without incrementing
export function getRateLimitInfo(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): RateLimitResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const now = Date.now()
  const entry = store[identifier]

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
