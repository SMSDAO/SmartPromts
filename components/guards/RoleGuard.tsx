'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/rbac'
import type { SubscriptionTier } from '@/lib/auth'

interface RoleGuardProps {
  /** Roles that are permitted to view the wrapped content */
  allowedRoles: Role[]
  /** Resolved subscription tier of the current user (from server component / session) */
  userTier: SubscriptionTier | null | undefined
  /** Where to send unauthorized users (defaults to '/dashboard') */
  redirectTo?: string
  /** Content to render when access is granted */
  children: React.ReactNode
  /** Optional fallback UI shown while redirecting */
  fallback?: React.ReactNode
}

/** Derive the Role from a SubscriptionTier (mirrors lib/rbac.ts getRole) */
function deriveRole(tier: SubscriptionTier | null | undefined): Role | null {
  if (!tier) return null
  if (tier === 'admin') return 'admin'
  if (tier === 'developer') return 'developer'
  return 'user'
}

/**
 * Client-side role guard.
 *
 * Renders `children` only when the user holds one of the `allowedRoles`.
 * Unauthenticated or unauthorised users are redirected. This guard is a
 * defence-in-depth layer; real enforcement happens on the server.
 */
export default function RoleGuard({
  allowedRoles,
  userTier,
  redirectTo = '/dashboard',
  children,
  fallback = null,
}: RoleGuardProps) {
  const router = useRouter()
  const role = deriveRole(userTier)
  const allowed = role !== null && allowedRoles.includes(role)

  useEffect(() => {
    if (!allowed) {
      router.replace(redirectTo)
    }
  }, [allowed, redirectTo, router])

  if (!allowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
