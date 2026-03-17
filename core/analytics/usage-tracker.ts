import { createServerSupabaseClient } from '@/lib/supabase'

export interface UsageEvent {
  id: string
  user_id: string
  event_type: string
  prompt_id?: string
  model?: string
  tokens?: number
  cost?: number
  latency_ms?: number
  created_at: string
}

export async function trackEvent(
  userId: string,
  eventType: string,
  metadata?: { prompt_id?: string; model?: string; tokens?: number; cost?: number; latency_ms?: number }
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.from('usage_events').insert({
    user_id: userId,
    event_type: eventType,
    ...metadata,
    created_at: new Date().toISOString(),
  })
}

export async function getUserEvents(userId: string, limit = 100): Promise<UsageEvent[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('usage_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to get events: ${error.message}`)
  return (data ?? []) as UsageEvent[]
}

export async function getTopPrompts(limit = 10): Promise<Array<{ prompt_id: string; count: number }>> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('usage_events')
    .select('prompt_id')
    .not('prompt_id', 'is', null)
    .limit(1000)
  if (error) throw new Error(`Failed to get top prompts: ${error.message}`)

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    if (row.prompt_id) counts[row.prompt_id] = (counts[row.prompt_id] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([prompt_id, count]) => ({ prompt_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getModelUsage(): Promise<Array<{ model: string; count: number; total_tokens: number }>> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('usage_events').select('model,tokens').not('model', 'is', null)
  if (error) throw new Error(`Failed to get model usage: ${error.message}`)

  const usage: Record<string, { count: number; total_tokens: number }> = {}
  for (const row of data ?? []) {
    if (!row.model) continue
    if (!usage[row.model]) usage[row.model] = { count: 0, total_tokens: 0 }
    usage[row.model].count++
    usage[row.model].total_tokens += row.tokens ?? 0
  }
  return Object.entries(usage).map(([model, stats]) => ({ model, ...stats }))
}
