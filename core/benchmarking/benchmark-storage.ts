import { createServerSupabaseClient } from '@/lib/supabase'
import type { BenchmarkResult } from './benchmark-runner'

export async function saveBenchmarkRun(result: BenchmarkResult, userId: string): Promise<{ id: string }> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('benchmark_runs')
    .insert({ ...result, user_id: userId, created_at: new Date().toISOString() })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to save benchmark run: ${error.message}`)
  return { id: data.id }
}

export async function getBenchmarkRun(id: string): Promise<(BenchmarkResult & { id: string; user_id: string; created_at: string }) | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('benchmark_runs')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function listBenchmarkRuns(userId?: string): Promise<Array<BenchmarkResult & { id: string; user_id: string; created_at: string }>> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('benchmark_runs').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) throw new Error(`Failed to list benchmark runs: ${error.message}`)
  return (data ?? []) as Array<BenchmarkResult & { id: string; user_id: string; created_at: string }>
}
