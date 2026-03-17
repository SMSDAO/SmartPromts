import { createServerSupabaseClient } from '@/lib/supabase'

export interface Experiment {
  id: string
  name: string
  prompt_a_id: string
  prompt_b_id: string
  status: 'running' | 'completed' | 'cancelled'
  winner?: string
  created_by: string
  created_at: string
}

export type ExperimentInsert = Omit<Experiment, 'id' | 'created_at' | 'status'> & { status?: Experiment['status'] }

export async function createExperiment(data: ExperimentInsert): Promise<Experiment> {
  const supabase = await createServerSupabaseClient()
  const { data: exp, error } = await supabase
    .from('experiments')
    .insert({ ...data, status: data.status ?? 'running', created_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw new Error(`Failed to create experiment: ${error.message}`)
  return exp as Experiment
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('experiments').select('*').eq('id', id).single()
  if (error) return null
  return data as Experiment
}

export async function listExperiments(userId?: string): Promise<Experiment[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('experiments').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('created_by', userId)
  const { data, error } = await query
  if (error) throw new Error(`Failed to list experiments: ${error.message}`)
  return (data ?? []) as Experiment[]
}

export async function completeExperiment(id: string, winner: string): Promise<Experiment> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('experiments')
    .update({ status: 'completed', winner })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to complete experiment: ${error.message}`)
  return data as Experiment
}

export async function cancelExperiment(id: string): Promise<Experiment> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('experiments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to cancel experiment: ${error.message}`)
  return data as Experiment
}
