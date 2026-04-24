'use client'

/**
 * Root-level App Router error boundary.
 *
 * Next.js renders this component when an unhandled error bubbles up from any
 * route segment below the root layout. The `reset` prop triggers a re-render
 * attempt without a full page reload.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Forward to error tracking in a non-blocking way
    import('@/lib/error-tracking')
      .then(({ captureException }) => {
        captureException(error, {
          extra: { digest: error.digest },
        })
      })
      .catch(() => {
        // Ignore tracking failures
      })
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-8 text-center dark:bg-gray-900">
          <div className="text-6xl">🚨</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Unexpected application error
          </h1>
          <p className="max-w-md text-gray-600 dark:text-gray-400">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : 'Something went wrong. Our team has been notified.'}
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-gray-400">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="rounded-md bg-cyan-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
