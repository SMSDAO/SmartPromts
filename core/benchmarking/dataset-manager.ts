import { createServerSupabaseClient } from '@/lib/supabase'

export interface InputExample {
  input: string
  context?: string
}

export interface Dataset {
  id: string
  name: string
  description: string
  input_examples: InputExample[]
  expected_outputs: string[]
  category: string
  created_by: string
  created_at: string
}

export type DatasetInsert = Omit<Dataset, 'id' | 'created_at'>

export async function createDataset(data: DatasetInsert): Promise<Dataset> {
  const supabase = await createServerSupabaseClient()
  const { data: dataset, error } = await supabase
    .from('datasets')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to create dataset: ${error.message}`)
  return dataset as Dataset
}

export async function getDataset(id: string): Promise<Dataset | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Dataset
}

export async function listDatasets(userId?: string): Promise<Dataset[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('datasets').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('created_by', userId)
  const { data, error } = await query
  if (error) throw new Error(`Failed to list datasets: ${error.message}`)
  return (data ?? []) as Dataset[]
}

export async function updateDataset(id: string, updates: Partial<DatasetInsert>): Promise<Dataset> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('datasets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to update dataset: ${error.message}`)
  return data as Dataset
}

export async function deleteDataset(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('datasets').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete dataset: ${error.message}`)
}
