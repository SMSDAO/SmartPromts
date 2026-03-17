import { createServerSupabaseClient } from '@/lib/supabase'
import { CREATOR_SHARE, PLATFORM_FEE } from './prompt-pricing'
import { generateLicense, type LicenseType } from './prompt-licensing'
import { getPrompt } from './marketplace-service'

export interface PromptPurchase {
  id: string
  prompt_id: string
  buyer_id: string
  amount: number
  creator_payout: number
  platform_fee: number
  license_type: string
  created_at: string
}

export async function purchasePrompt(promptId: string, buyerId: string, licenseType: LicenseType): Promise<PromptPurchase & { license: ReturnType<typeof generateLicense> }> {
  const prompt = await getPrompt(promptId)
  if (!prompt) throw new Error('Prompt not found')

  const amount = prompt.price
  const creator_payout = amount * CREATOR_SHARE
  const platform_fee = amount * PLATFORM_FEE

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('prompt_purchases')
    .insert({
      prompt_id: promptId,
      buyer_id: buyerId,
      amount,
      creator_payout,
      platform_fee,
      license_type: licenseType,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to record purchase: ${error.message}`)

  // Increment download counter
  await supabase.from('marketplace_prompts').update({ downloads: prompt.downloads + 1 }).eq('id', promptId)

  const license = generateLicense(promptId, buyerId, licenseType)
  return { ...(data as PromptPurchase), license }
}

export async function getPurchase(id: string): Promise<PromptPurchase | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('prompt_purchases').select('*').eq('id', id).single()
  if (error) return null
  return data as PromptPurchase
}

export async function listUserPurchases(userId: string): Promise<PromptPurchase[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('prompt_purchases')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to list purchases: ${error.message}`)
  return (data ?? []) as PromptPurchase[]
}

export async function hasPurchased(promptId: string, userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('prompt_purchases')
    .select('id')
    .eq('prompt_id', promptId)
    .eq('buyer_id', userId)
    .single()
  return data !== null
}
