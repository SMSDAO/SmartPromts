'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/rbac'
import type { SubscriptionTier } from '@/lib/auth'

interface RoleGuardProps {
  /** Roles that are permitted to view the wrapped content */
  allowedRoles: Role[]
  /**
   * Resolved subscription tier of the current user.
   * - `undefined` → still loading (no redirect yet)
   * - `null`      → unauthenticated (redirect)
   * - string      → tier resolved (check role then redirect if needed)
   */
  userTier: SubscriptionTier | null | undefined
  /** Where to send unauthorized users (defaults to '/dashboard') */
  redirectTo?: string
  /** Content to render when access is granted */
  children: React.ReactNode
  /** Optional fallback UI shown while the tier is loading or redirecting */
  fallback?: React.ReactNode
}

/** Derive the Role from a SubscriptionTier (mirrors lib/rbac.ts getRole) */
function deriveRole(tier: SubscriptionTier | null | undefined): Role | null {
  if (tier == null) return null
  if (tier === 'admin') return 'admin'
  if (tier === 'developer') return 'developer'
  return 'user'
}

/**
 * Client-side role guard.
 *
 * - While `userTier` is `undefined` the guard renders `fallback` and waits.
 * - Once `userTier` is resolved (`null` or a known tier), the guard checks
 *   the role and redirects unauthenticated / unauthorised visitors.
 *
 * This is a defence-in-depth layer; real enforcement happens on the server.
 */
export default function RoleGuard({
  allowedRoles,
  userTier,
  redirectTo = '/dashboard',
  children,
  fallback = null,
}: RoleGuardProps) {
  const router = useRouter()
  const isLoading = userTier === undefined
  const role = deriveRole(userTier)
  const allowed = role !== null && allowedRoles.includes(role)

  useEffect(() => {
    // Don't redirect while the tier is still being resolved
    if (isLoading) return
    if (!allowed) {
      router.replace(redirectTo)
    }
  }, [isLoading, allowed, redirectTo, router])

  // Show fallback while loading or redirecting
  if (isLoading || !allowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
