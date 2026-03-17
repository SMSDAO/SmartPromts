import { createServerSupabaseClient } from '@/lib/supabase'

export interface SuccessRecord {
  id: string
  user_id: string
  prompt_id: string
  success: boolean
  score?: number
  created_at: string
}

export async function recordResult(userId: string, promptId: string, success: boolean, score?: number): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.from('analytics_success').insert({
    user_id: userId,
    prompt_id: promptId,
    success,
    score: score ?? (success ? 1 : 0),
    created_at: new Date().toISOString(),
  })
}

export async function getSuccessRate(userId?: string, promptId?: string): Promise<{ success_rate: number; total: number }> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('analytics_success').select('success')
  if (userId) query = query.eq('user_id', userId)
  if (promptId) query = query.eq('prompt_id', promptId)
  const { data, error } = await query
  if (error || !data?.length) return { success_rate: 0, total: 0 }
  const successes = data.filter(r => r.success).length
  return { success_rate: successes / data.length, total: data.length }
}

export async function getPromptLeaderboard(limit = 10): Promise<Array<{ prompt_id: string; success_rate: number; total: number; avg_score: number }>> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('analytics_success').select('prompt_id,success,score')
  if (error) throw new Error(`Failed to get leaderboard: ${error.message}`)

  const stats: Record<string, { successes: number; total: number; score_sum: number }> = {}
  for (const row of data ?? []) {
    if (!row.prompt_id) continue
    if (!stats[row.prompt_id]) stats[row.prompt_id] = { successes: 0, total: 0, score_sum: 0 }
    stats[row.prompt_id].total++
    if (row.success) stats[row.prompt_id].successes++
    stats[row.prompt_id].score_sum += row.score ?? 0
  }

  return Object.entries(stats)
    .map(([prompt_id, s]) => ({
      prompt_id,
      success_rate: s.successes / s.total,
      total: s.total,
      avg_score: s.score_sum / s.total,
    }))
    .sort((a, b) => b.success_rate - a.success_rate)
    .slice(0, limit)
}
