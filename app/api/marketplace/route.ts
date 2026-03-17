import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { listPrompts, createListing } from '@/core/marketplace/marketplace-service'
import { validatePrice } from '@/core/marketplace/prompt-pricing'
import { z } from 'zod'

const CreateListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  prompt: z.string().min(1).max(10000),
  category: z.string().default('general'),
  price: z.number().min(0),
  tags: z.array(z.string()).default([]),
  license: z.string().default('personal'),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined
    const search = searchParams.get('search') ?? undefined
    const min_price = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined
    const max_price = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined

    const prompts = await listPrompts({ category, search, min_price, max_price })
    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('GET /api/marketplace error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = CreateListingSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const priceValidation = validatePrice(parsed.data.price)
    if (!priceValidation.valid) return NextResponse.json({ error: priceValidation.error }, { status: 400 })

    const listing = await createListing({ ...parsed.data, creator_id: session.user.id })
    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('POST /api/marketplace error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
