import { createServerSupabaseClient } from '@/lib/supabase'

export interface LatencyRecord {
  id: string
  user_id: string
  model: string
  latency_ms: number
  prompt_id?: string
  created_at: string
}

export async function recordLatency(userId: string, model: string, latencyMs: number, promptId?: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.from('analytics_latency').insert({
    user_id: userId,
    model,
    latency_ms: latencyMs,
    prompt_id: promptId,
    created_at: new Date().toISOString(),
  })
}

export async function getAverageLatency(filter?: { model?: string; user_id?: string }): Promise<number> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('analytics_latency').select('latency_ms')
  if (filter?.model) query = query.eq('model', filter.model)
  if (filter?.user_id) query = query.eq('user_id', filter.user_id)
  const { data, error } = await query
  if (error || !data?.length) return 0
  return data.reduce((s, r) => s + r.latency_ms, 0) / data.length
}

export async function getLatencyPercentiles(model?: string): Promise<{ p50: number; p90: number; p99: number }> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('analytics_latency').select('latency_ms').order('latency_ms', { ascending: true })
  if (model) query = query.eq('model', model)
  const { data, error } = await query
  if (error || !data?.length) return { p50: 0, p90: 0, p99: 0 }
  const values = data.map(r => r.latency_ms)
  const p = (pct: number) => values[Math.floor((pct / 100) * values.length)] ?? 0
  return { p50: p(50), p90: p(90), p99: p(99) }
}
