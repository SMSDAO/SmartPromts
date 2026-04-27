'use client'

/**
 * Client-side performance monitoring utilities.
 *
 * Intended for use in `app/layout.tsx` via the `reportWebVitals` export.
 * Uses `navigator.sendBeacon` (with a `fetch` fallback) to forward Web Vitals
 * metrics to your analytics endpoint without blocking the page.
 *
 * This module **must not** import server-only modules (e.g. pino) because it
 * is included in the client bundle.
 *
 * @example
 * // app/layout.tsx
 * import { reportVital } from '@/lib/performance.client'
 * export { reportVital as reportWebVitals }
 */

// ---------------------------------------------------------------------------
// Web Vitals
// ---------------------------------------------------------------------------

export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
}

/**
 * Forward a Web Vitals metric to `/api/vitals` using `sendBeacon` or `fetch`.
 * Replace the endpoint URL or body shape to match your analytics backend.
 */
export function reportVital(metric: WebVitalsMetric): void {
  const url = '/api/vitals'
  const body = JSON.stringify(metric)

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
  } else {
    fetch(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Best-effort – ignore failures
    })
  }
}
