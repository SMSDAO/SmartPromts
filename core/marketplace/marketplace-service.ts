import { createServerSupabaseClient } from '@/lib/supabase'

export interface MarketplacePrompt {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  price: number
  creator_id: string
  downloads: number
  rating: number
  tags: string[]
  license: string
  created_at: string
}

export type MarketplaceFilter = {
  category?: string
  min_price?: number
  max_price?: number
  search?: string
  sort_by?: 'created_at' | 'downloads' | 'rating' | 'price'
  sort_order?: 'asc' | 'desc'
}

export async function listPrompts(filter?: MarketplaceFilter): Promise<MarketplacePrompt[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('marketplace_prompts').select('*')
  if (filter?.category) query = query.eq('category', filter.category)
  if (filter?.min_price != null) query = query.gte('price', filter.min_price)
  if (filter?.max_price != null) query = query.lte('price', filter.max_price)
  if (filter?.search) query = query.ilike('title', `%${filter.search}%`)
  const sortField = filter?.sort_by ?? 'created_at'
  const ascending = filter?.sort_order === 'asc'
  query = query.order(sortField, { ascending })
  const { data, error } = await query
  if (error) throw new Error(`Failed to list prompts: ${error.message}`)
  return (data ?? []) as MarketplacePrompt[]
}

export async function getPrompt(id: string): Promise<MarketplacePrompt | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('marketplace_prompts').select('*').eq('id', id).single()
  if (error) return null
  return data as MarketplacePrompt
}

export async function createListing(data: Omit<MarketplacePrompt, 'id' | 'created_at' | 'downloads' | 'rating'>): Promise<MarketplacePrompt> {
  const supabase = await createServerSupabaseClient()
  const { data: prompt, error } = await supabase
    .from('marketplace_prompts')
    .insert({ ...data, downloads: 0, rating: 0, created_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw new Error(`Failed to create listing: ${error.message}`)
  return prompt as MarketplacePrompt
}

export async function updateListing(id: string, updates: Partial<MarketplacePrompt>): Promise<MarketplacePrompt> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('marketplace_prompts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to update listing: ${error.message}`)
  return data as MarketplacePrompt
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('marketplace_prompts').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete listing: ${error.message}`)
}

export async function searchPrompts(query: string): Promise<MarketplacePrompt[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('marketplace_prompts')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('downloads', { ascending: false })
  if (error) throw new Error(`Failed to search prompts: ${error.message}`)
  return (data ?? []) as MarketplacePrompt[]
}
