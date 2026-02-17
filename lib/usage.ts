import { createServerSupabaseClient } from './supabase'
import type { SubscriptionTier } from './auth'

// Usage limits per tier (monthly)
const USAGE_LIMITS: Record<SubscriptionTier, number> = {
  free: 10,
  pro: 1000,
  enterprise: -1, // unlimited
}

export interface UsageCheckResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: Date
}

// Check if user has remaining usage
export async function checkUsageLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<UsageCheckResult> {
  const supabase = await createServerSupabaseClient()

  const { data: user } = await supabase
    .from('users')
    .select('usage_count, usage_reset_at')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  const limit = USAGE_LIMITS[tier]
  const resetAt = new Date(user.usage_reset_at)
  const now = new Date()

  // Reset usage if period expired
  if (now > resetAt) {
    const newResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    const { error } = await supabase
      .from('users')
      .update({
        usage_count: 0,
        usage_reset_at: newResetAt.toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to reset usage: ${error.message}`)
    }

    return {
      allowed: true,
      remaining: limit === -1 ? -1 : limit,
      limit,
      resetAt: newResetAt,
    }
  }

  // Check limit
  const remaining = limit === -1 ? -1 : limit - user.usage_count
  const allowed = limit === -1 || user.usage_count < limit

  return {
    allowed,
    remaining,
    limit,
    resetAt,
  }
}

// Increment usage count
export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.rpc('increment_usage', { user_id: userId })
  
  if (error) {
    throw new Error(`Failed to increment usage: ${error.message || String(error)}`)
  }
}

// Get usage stats
export async function getUsageStats(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: user } = await supabase
    .from('users')
    .select('usage_count, usage_reset_at, subscription_tier')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  const limit = USAGE_LIMITS[user.subscription_tier as SubscriptionTier]
  const remaining = limit === -1 ? -1 : limit - user.usage_count

  return {
    used: user.usage_count,
    remaining,
    limit,
    resetAt: new Date(user.usage_reset_at),
    tier: user.subscription_tier,
  }
}
