/**
 * Standardized API error handling utilities.
 *
 * Provides consistent error response shapes, HTTP status mapping, and
 * request-ID tracking across all API routes.
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from './logger'

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export interface ApiErrorBody {
  error: string
  code: ApiErrorCode
  requestId?: string
  details?: unknown
}

// ---------------------------------------------------------------------------
// HTTP status mapping
// ---------------------------------------------------------------------------

const HTTP_STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

/**
 * Build a standardized JSON error response.
 *
 * @param message  - Human-readable error description
 * @param code     - Machine-readable error code
 * @param options  - Optional requestId and extra details (omitted in production)
 */
export function apiError(
  message: string,
  code: ApiErrorCode,
  options: { requestId?: string; details?: unknown } = {},
): NextResponse<ApiErrorBody> {
  const status = HTTP_STATUS[code]
  const body: ApiErrorBody = {
    error: message,
    code,
    ...(options.requestId && { requestId: options.requestId }),
    // Expose details only outside production to prevent information leakage
    ...(process.env.NODE_ENV !== 'production' && options.details !== undefined
      ? { details: options.details }
      : {}),
  }
  return NextResponse.json(body, { status })
}

// Convenience constructors
export const badRequest = (msg: string, opts?: { requestId?: string; details?: unknown }) =>
  apiError(msg, 'BAD_REQUEST', opts)

export const unauthorized = (msg = 'Unauthorized', opts?: { requestId?: string }) =>
  apiError(msg, 'UNAUTHORIZED', opts)

export const forbidden = (msg = 'Forbidden', opts?: { requestId?: string }) =>
  apiError(msg, 'FORBIDDEN', opts)

export const notFound = (msg = 'Not found', opts?: { requestId?: string }) =>
  apiError(msg, 'NOT_FOUND', opts)

export const rateLimited = (
  msg = 'Too many requests',
  opts?: { requestId?: string; details?: unknown },
) => apiError(msg, 'RATE_LIMITED', opts)

export const internalError = (msg = 'Internal server error', opts?: { requestId?: string }) =>
  apiError(msg, 'INTERNAL_ERROR', opts)

export const serviceUnavailable = (
  msg = 'Service temporarily unavailable',
  opts?: { requestId?: string },
) => apiError(msg, 'SERVICE_UNAVAILABLE', opts)

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

/**
 * Convert any thrown value to a standardized API error response.
 * Logs the error and returns the appropriate HTTP response.
 *
 * @param err       - The caught error (unknown type)
 * @param requestId - Optional request ID for correlation
 */
export function handleApiError(err: unknown, requestId?: string): NextResponse<ApiErrorBody> {
  if (err instanceof ZodError) {
    logger.warn({ requestId, issues: err.issues }, 'Request validation failed')
    return apiError('Invalid request data', 'VALIDATION_ERROR', {
      requestId,
      details: err.issues,
    })
  }

  if (err instanceof Error) {
    logger.error({ requestId, err }, err.message)
    return internalError('Internal server error', { requestId })
  }

  logger.error({ requestId, err }, 'Unknown error')
  return internalError('Internal server error', { requestId })
}

// ---------------------------------------------------------------------------
// Request ID generation
// ---------------------------------------------------------------------------

/**
 * Generate a short, URL-safe request identifier for log correlation.
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
