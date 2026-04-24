/**
 * Error tracking integration.
 *
 * Provides a thin abstraction over error monitoring services (Sentry, Axiom,
 * etc.). Swap the placeholder implementation by replacing the bodies of the
 * exported functions – call sites remain unchanged.
 *
 * This module is safe to import from both server and client components.
 * It deliberately avoids importing the server-only Pino logger so that
 * Next.js client bundles do not pull in Node.js-only dependencies.
 *
 * Environment variable to enable a real integration:
 *   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ErrorContext {
  /** Authenticated user ID (never email or PII) */
  userId?: string
  /** Correlation ID from X-Request-Id header */
  requestId?: string
  /** Current URL or route path */
  url?: string
  /** Additional structured metadata */
  extra?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Capture an exception and forward it to the configured monitoring service.
 *
 * Replace the body with a real SDK call, e.g.:
 *   Sentry.withScope((scope) => { scope.setUser(…); Sentry.captureException(err) })
 */
export function captureException(err: unknown, context?: ErrorContext): void {
  // In production, integrate a real error tracking service here.
  // Using console.error keeps this module safe for both server and client bundles.
  if (process.env.NODE_ENV !== 'production') {
    console.error('[error-tracking] captureException', { err, ...context })
  }
}

/**
 * Capture a non-fatal message or warning.
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[error-tracking] captureMessage', message, context)
  }
}

/**
 * Set user context for subsequent captures within the same scope.
 * Only pass the user ID – never PII such as email or name.
 */
export function setUserContext(userId: string): void {
  // e.g. Sentry.setUser({ id: userId })
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[error-tracking] setUserContext', userId)
  }
}

/**
 * Clear user context (e.g. on sign-out).
 */
export function clearUserContext(): void {
  // e.g. Sentry.setUser(null)
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[error-tracking] clearUserContext')
  }
}
