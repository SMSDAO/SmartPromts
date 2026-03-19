/**
 * Role-Based Access Control (RBAC) core module
 *
 * Roles are derived from subscription_tier:
 *   admin      → 'admin'
 *   developer  → 'developer'
 *   all others → 'user'
 */

import { NextRequest, NextResponse } from 'next/server'
import type { SubscriptionTier } from './auth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Three-tier role hierarchy used throughout the app */
export type Role = 'admin' | 'developer' | 'user'

/** Minimal user shape required by RBAC helpers */
export interface RbacUser {
  id: string
  subscription_tier: SubscriptionTier
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a subscription tier to a Role.
 * Server-side only — never trust a client-supplied role.
 */
export function getRole(tier: SubscriptionTier): Role {
  if (tier === 'admin') return 'admin'
  if (tier === 'developer') return 'developer'
  return 'user'
}

/**
 * Return true when the user holds at least one of the specified roles.
 *
 * @param user  - Authenticated user object from the DB (server-side)
 * @param roles - Roles that grant access
 */
export function hasRole(user: RbacUser, roles: Role[]): boolean {
  const userRole = getRole(user.subscription_tier)
  return roles.includes(userRole)
}

// ---------------------------------------------------------------------------
// API route helpers
// ---------------------------------------------------------------------------

/**
 * Handler factory – wraps a Next.js API route handler with RBAC enforcement.
 *
 * Usage:
 *   export const POST = enforceRole(handler, ['admin', 'developer'])
 *
 * The inner handler receives the request and the resolved user object.
 * Accepts handlers that return either NextResponse or the native Response.
 */
export function enforceRole(
  handler: (req: NextRequest, user: RbacUser) => Promise<Response | NextResponse>,
  roles: Role[],
): (req: NextRequest) => Promise<NextResponse | Response> {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    // Single dynamic import to avoid redundant module loads
    const { createServerSupabaseClient, createAdminClient } = await import('./supabase')

    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch tier from DB using the privileged client to prevent spoofing
    const adminClient = createAdminClient()
    const { data: user, error } = await adminClient
      .from('users')
      .select('id, subscription_tier')
      .eq('id', session.user.id)
      .single()

    if (error) {
      // Distinguish "user row missing" from infrastructure errors
      if ((error as { code?: string }).code === 'PGRST116') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasRole(user as RbacUser, roles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req, user as RbacUser)
  }
}

/**
 * Middleware-style wrapper – same as enforceRole but expressed as a
 * higher-order function.
 *
 * Usage:
 *   export const POST = withRole(['developer', 'admin'])(async (req, user) => { … })
 */
export function withRole(roles: Role[]) {
  return function wrap(
    handler: (req: NextRequest, user: RbacUser) => Promise<Response | NextResponse>,
  ) {
    return enforceRole(handler, roles)
  }
}
