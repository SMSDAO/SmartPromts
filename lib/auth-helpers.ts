/**
 * Authentication helper utilities.
 *
 * Provides server-side session extraction, authentication enforcement, and
 * role-based access control helpers for use in API routes and Server
 * Components.
 *
 * These helpers complement the existing `lib/auth.ts` and `lib/rbac.ts`
 * modules by exposing a concise middleware-friendly API.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from './supabase'
import { getCurrentUser, upsertUser } from './auth'
import type { User } from './auth'
import { hasRole, getRole } from './rbac'
import type { Role } from './rbac'

// ---------------------------------------------------------------------------
// Session extraction
// ---------------------------------------------------------------------------

/**
 * Extract the Supabase session from server-side cookies.
 * Returns null when no valid session is present.
 */
export async function getSessionFromRequest(_req?: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// ---------------------------------------------------------------------------
// Auth enforcement
// ---------------------------------------------------------------------------

/**
 * Resolve the current user or return a 401 NextResponse.
 *
 * Designed for direct use in route handlers:
 * ```ts
 * const result = await requireAuth()
 * if (result instanceof NextResponse) return result
 * const user = result // typed as User
 * ```
 */
export async function requireAuth(): Promise<User | NextResponse> {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.banned) {
    return NextResponse.json(
      { error: 'Account suspended – please contact support' },
      { status: 403 },
    )
  }
  return user
}

// ---------------------------------------------------------------------------
// RBAC enforcement
// ---------------------------------------------------------------------------

/**
 * Resolve the current user and assert that they hold at least one of the
 * specified roles. Returns 401 if unauthenticated, 403 if the role check
 * fails.
 *
 * ```ts
 * const result = await requireRole(['admin', 'developer'])
 * if (result instanceof NextResponse) return result
 * const user = result
 * ```
 */
export async function requireRole(roles: Role[]): Promise<User | NextResponse> {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const user = authResult
  if (!hasRole({ id: user.id, subscription_tier: user.subscription_tier }, roles)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return user
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the current session and auto-provision a user row if needed.
 * Returns null if there is no active session.
 */
export async function resolveSessionUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  return upsertUser(session.user.id, session.user.email ?? '')
}

/**
 * Return the Role string for a user retrieved from `requireAuth` /
 * `resolveSessionUser`. Convenience wrapper around `getRole`.
 */
export { getRole }
