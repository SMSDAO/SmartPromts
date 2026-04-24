'use client'

/**
 * Reusable React Error Boundary component.
 *
 * Catches unhandled JavaScript errors in the component tree, logs them via
 * the error tracking integration, and renders a user-friendly fallback UI
 * with a one-click recovery action.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Custom fallback UI. Receives the error and a reset callback. */
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Forward to the error tracking integration.
    // Dynamic import avoids including server-only modules in the client bundle.
    import('@/lib/error-tracking')
      .then(({ captureException }) => {
        captureException(error, {
          extra: { componentStack: info.componentStack ?? undefined },
        })
      })
      .catch(() => {
        // Silently ignore if error tracking fails
      })
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children
    }

    const { fallback } = this.props
    const { error } = this.state

    if (typeof fallback === 'function') {
      return fallback(error, this.reset)
    }

    if (fallback) {
      return fallback
    }

    return <DefaultErrorFallback error={error} reset={this.reset} />
  }
}

// ---------------------------------------------------------------------------
// Default fallback UI
// ---------------------------------------------------------------------------

interface DefaultErrorFallbackProps {
  error: Error
  reset: () => void
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950"
    >
      <div className="text-4xl">⚠️</div>
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-red-600 dark:text-red-400">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorBoundary
