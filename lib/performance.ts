/**
 * Performance monitoring utilities.
 *
 * Tracks API response times and database query durations via the shared
 * structured logger.  These functions are **server-only** – do not import
 * this module from client components.
 *
 * For Web Vitals reporting in client components use `lib/performance.client.ts`.
 *
 * Swap the logger calls for real APM SDK calls (Datadog, New Relic, etc.)
 * as needed.
 */

import { logger } from './logger'

// ---------------------------------------------------------------------------
// Timer helpers
// ---------------------------------------------------------------------------

/**
 * Start a high-resolution timer. Returns a function that, when called,
 * returns the elapsed duration in milliseconds.
 */
export function startTimer(): () => number {
  const start = Date.now()
  return () => Date.now() - start
}

// ---------------------------------------------------------------------------
// API response time tracking
// ---------------------------------------------------------------------------

/**
 * Record the duration of an API route execution.
 *
 * @param route      - Route identifier, e.g. 'POST /api/optimize'
 * @param durationMs - Elapsed time in milliseconds
 * @param metadata   - Optional structured metadata (userId, statusCode, etc.)
 */
export function recordApiLatency(
  route: string,
  durationMs: number,
  metadata?: Record<string, unknown>,
): void {
  logger.info({ route, durationMs, ...metadata }, 'api.latency')
}

// ---------------------------------------------------------------------------
// Database query tracking
// ---------------------------------------------------------------------------

/**
 * Record the duration of a database operation.
 *
 * @param operation  - Short label, e.g. 'users.upsert'
 * @param durationMs - Elapsed time in milliseconds
 * @param metadata   - Optional structured metadata
 */
export function recordDbLatency(
  operation: string,
  durationMs: number,
  metadata?: Record<string, unknown>,
): void {
  logger.debug({ operation, durationMs, ...metadata }, 'db.latency')
}

// ---------------------------------------------------------------------------
// Generic timing wrapper
// ---------------------------------------------------------------------------

/**
 * Wrap an async function and automatically record its execution duration.
 *
 * @param label - Metric label used in the log entry
 * @param fn    - Async function to measure
 */
export async function timed<T>(
  label: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const elapsed = startTimer()
  try {
    const result = await fn()
    recordApiLatency(label, elapsed(), metadata)
    return result
  } catch (err) {
    recordApiLatency(label, elapsed(), { ...metadata, error: true })
    throw err
  }
}
