/**
 * Reusable API middleware factory for Next.js App Router route handlers.
 *
 * Composable wrappers that add:
 *  - Request ID injection
 *  - Input validation (Zod)
 *  - Authentication enforcement
 *  - Rate limiting with standard headers
 *  - Structured error handling
 *
 * Usage:
 *   export const POST = withMiddleware(
 *     withValidation(MySchema),
 *     withAuth(),
 *     withRateLimit({ limit: 10, interval: 60_000 }),
 *   )(async (req, ctx) => {
 *     const body = ctx.body as MySchemaType
 *     const user = ctx.user
 *     …
 *   })
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ZodSchema, ZodError } from 'zod'
import { rateLimitAsync, type RateLimitOptions } from './rate-limit'
import { generateRequestId, handleApiError, unauthorized, forbidden, rateLimited, badRequest } from './api-error-handler'
import { logger } from './logger'

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface MiddlewareContext {
  requestId: string
  /** Validated and parsed request body (set by withValidation) */
  body?: unknown
  /** Authenticated user (set by withAuth) */
  user?: {
    id: string
    email: string
    subscription_tier: string
    banned: boolean
  }
}

export type RouteHandler = (
  req: NextRequest,
  ctx: MiddlewareContext,
) => Promise<Response | NextResponse>

export type MiddlewareFn = (handler: RouteHandler) => RouteHandler

// ---------------------------------------------------------------------------
// Request ID middleware
// ---------------------------------------------------------------------------

/**
 * Injects a unique request ID into context and attaches it to the response.
 * Always the outermost wrapper in the chain.
 */
export function withRequestId(): MiddlewareFn {
  return (handler) =>
    async (req, ctx) => {
      const requestId = req.headers.get('x-request-id') ?? generateRequestId()
      const result = await handler(req, { ...ctx, requestId })
      if (result instanceof NextResponse) {
        result.headers.set('X-Request-Id', requestId)
        return result
      }
      // Clone a plain Response and attach the request ID header
      const cloned = new Response(result.body, result)
      cloned.headers.set('X-Request-Id', requestId)
      return cloned
    }
}

// ---------------------------------------------------------------------------
// Validation middleware
// ---------------------------------------------------------------------------

/**
 * Parses and validates the JSON request body against a Zod schema.
 * Sets `ctx.body` to the validated value. Returns 422 on failure.
 */
export function withValidation<T>(schema: ZodSchema<T>): MiddlewareFn {
  return (handler) =>
    async (req, ctx) => {
      try {
        const raw = await req.json()
        const parsed = schema.parse(raw)
        return handler(req, { ...ctx, body: parsed })
      } catch (err) {
        if (err instanceof SyntaxError) {
          return badRequest('Invalid JSON – request body could not be parsed', {
            requestId: ctx.requestId,
          })
        }
        const zodErr = err as ZodError
        if (zodErr?.issues) {
          return handleApiError(zodErr, ctx.requestId)
        }
        return handleApiError(err, ctx.requestId)
      }
    }
}

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------

/**
 * Enforces authentication by resolving the current user session.
 * Sets `ctx.user` on success; returns 401 if unauthenticated.
 */
export function withAuth(): MiddlewareFn {
  return (handler) =>
    async (req, ctx) => {
      const { createServerSupabaseClient } = await import('./supabase')
      const { upsertUser } = await import('./auth')

      const supabase = await createServerSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return unauthorized('Unauthorized – please log in', { requestId: ctx.requestId })
      }

      const email = session.user.email?.trim()
      if (!email) {
        return unauthorized('Unauthorized – account email is required', {
          requestId: ctx.requestId,
        })
      }

      const user = await upsertUser(session.user.id, email)

      if (user.banned) {
        return forbidden('Account suspended – contact support', { requestId: ctx.requestId })
      }

      return handler(req, { ...ctx, user })
    }
}

// ---------------------------------------------------------------------------
// Rate-limit middleware
// ---------------------------------------------------------------------------

/**
 * Applies async rate limiting and adds standard RateLimit headers.
 * Requires `ctx.user` to be set (place after withAuth).
 *
 * @param options - Rate limit configuration (limit + interval)
 * @param prefix  - Key prefix to namespace different limit buckets
 */
export function withRateLimit(
  options?: Partial<RateLimitOptions>,
  prefix = 'api',
): MiddlewareFn {
  return (handler) =>
    async (req, ctx) => {
      const identifier = ctx.user
        ? `${prefix}:${ctx.user.id}`
        : `${prefix}:${req.headers.get('x-forwarded-for') ?? 'unknown'}`

      const result = await rateLimitAsync(identifier, options)

      const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
      }

      if (!result.success) {
        const response = rateLimited('Rate limit exceeded – please slow down', {
          requestId: ctx.requestId,
          details: { reset: result.reset },
        })
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
        return response
      }

      const response = await handler(req, ctx)
      if (response instanceof NextResponse) {
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
        return response
      }
      // Clone a plain Response and attach rate-limit headers
      const cloned = new Response(response.body, response)
      Object.entries(headers).forEach(([k, v]) => cloned.headers.set(k, v))
      return cloned
    }
}

// ---------------------------------------------------------------------------
// Error handler middleware
// ---------------------------------------------------------------------------

/**
 * Top-level try/catch wrapper. Catches unhandled errors from the inner
 * handler and returns a standardized 500 response.
 */
export function withErrorHandler(): MiddlewareFn {
  return (handler) =>
    async (req, ctx) => {
      try {
        return await handler(req, ctx)
      } catch (err) {
        logger.error({ requestId: ctx.requestId, err }, 'Unhandled route error')
        return handleApiError(err, ctx.requestId)
      }
    }
}

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------

/**
 * Compose multiple middleware functions into a single wrapper.
 * Middleware is applied outermost-first (left to right).
 *
 * withRequestId is automatically prepended to every composed chain.
 *
 * @example
 * export const POST = withMiddleware(
 *   withErrorHandler(),
 *   withAuth(),
 *   withRateLimit({ limit: 10, interval: 60_000 }),
 *   withValidation(MySchema),
 * )(myHandler)
 */
export function withMiddleware(...fns: MiddlewareFn[]) {
  return (handler: RouteHandler): ((req: NextRequest) => Promise<Response | NextResponse>) => {
    const allFns = [withRequestId(), ...fns]
    const composed = allFns.reduceRight<RouteHandler>((next, fn) => fn(next), handler)
    return (req: NextRequest) => composed(req, { requestId: '' })
  }
}
