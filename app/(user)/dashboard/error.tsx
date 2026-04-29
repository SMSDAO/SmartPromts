'use client'

/**
 * Dashboard-scoped App Router error boundary.
 *
 * Catches unhandled errors inside the dashboard route group and presents a
 * contextual recovery UI without disrupting the rest of the application.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

import { useEffect } from 'react'
import Link from 'next/link'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    import('@/lib/error-tracking')
      .then(({ captureException }) => {
        captureException(error, {
          url: '/dashboard',
          extra: { digest: error.digest },
        })
      })
      .catch(() => {
        // Ignore tracking failures
      })
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="text-5xl">📊</div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Dashboard encountered an error
      </h2>
      <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : "We couldn't load your dashboard. Please try refreshing."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-gray-400">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-cyan-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          Retry
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Reload dashboard
        </Link>
      </div>
    </div>
  )
}
