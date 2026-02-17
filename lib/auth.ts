import { createServerSupabaseClient } from './supabase'
import { NextResponse } from 'next/server'

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface User {
  id: string
  email: string
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  usage_count: number
  usage_reset_at: string
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return user
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return user
}

// Upsert user (create or update)
export async function upsertUser(userId: string, email: string): Promise<User> {
  const supabase = await createServerSupabaseClient()
  
  const now = new Date().toISOString()
  const resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now

  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email,
      subscription_tier: 'free',
      usage_count: 0,
      usage_reset_at: resetAt,
      updated_at: now,
    }, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`)
  }

  return data
}

// Require authentication middleware
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  return user
}
