import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from './supabase'

export interface AdminUser {
  id: string
  email: string
  subscription_tier: 'admin'
}

/**
 * Middleware to require admin authentication
 * Returns the admin user if authenticated, or a 401/403 response if not
 */
export async function requireAdmin(): Promise<AdminUser | NextResponse> {
  // Get session from cookies
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    )
  }

  // Use admin client to fetch user data
  const supabaseAdmin = createAdminClient()
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, subscription_tier')
    .eq('id', session.user.id)
    .single()

  // Distinguish "no row found" from other errors
  if (error) {
    // Supabase/PostgREST uses PGRST116 for "Results contain 0 rows" with .single()
    if ((error as any).code === 'PGRST116') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  // Check if user has admin tier
  if (user.subscription_tier !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    )
  }

  return user as AdminUser
}

/**
 * Get Supabase admin client for privileged operations
 */
export function getAdminClient() {
  return createAdminClient()
}
