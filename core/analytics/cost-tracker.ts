import { createServerSupabaseClient } from '@/lib/supabase'

const COST_PER_TOKEN: Record<string, number> = {
  'gpt-4': 0.00003,
  'gpt-3.5-turbo': 0.000002,
  'claude-3-opus': 0.000015,
  'gemini-pro': 0.000001,
  'local-llama': 0,
  default: 0.000002,
}

export function calculateTokenCost(tokens: number, model: string): number {
  const rate = COST_PER_TOKEN[model] ?? COST_PER_TOKEN.default
  return tokens * rate
}

export async function getUserCostSummary(userId: string, period?: 'day' | 'week' | 'month'): Promise<{ total_cost: number; total_tokens: number; runs: number }> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('usage_events').select('tokens,cost,model').eq('user_id', userId)

  if (period) {
    const now = new Date()
    const since = new Date(now)
    if (period === 'day') since.setDate(now.getDate() - 1)
    else if (period === 'week') since.setDate(now.getDate() - 7)
    else since.setMonth(now.getMonth() - 1)
    query = query.gte('created_at', since.toISOString())
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to get cost summary: ${error.message}`)

  let total_cost = 0
  let total_tokens = 0
  for (const row of data ?? []) {
    total_tokens += row.tokens ?? 0
    total_cost += row.cost ?? calculateTokenCost(row.tokens ?? 0, row.model ?? 'default')
  }

  return { total_cost, total_tokens, runs: (data ?? []).length }
}

export async function getPlatformCostSummary(): Promise<{ total_cost: number; total_tokens: number; total_users: number }> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('usage_events').select('tokens,cost,model,user_id')
  if (error) throw new Error(`Failed to get platform cost summary: ${error.message}`)

  let total_cost = 0
  let total_tokens = 0
  const users = new Set<string>()
  for (const row of data ?? []) {
    total_tokens += row.tokens ?? 0
    total_cost += row.cost ?? calculateTokenCost(row.tokens ?? 0, row.model ?? 'default')
    if (row.user_id) users.add(row.user_id)
  }
  return { total_cost, total_tokens, total_users: users.size }
}
