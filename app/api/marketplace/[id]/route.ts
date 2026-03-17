import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPrompt, updateListing, deleteListing } from '@/core/marketplace/marketplace-service'
import { z } from 'zod'

const UpdateListingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  prompt: z.string().min(1).max(10000).optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  license: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const prompt = await getPrompt(id)
    if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('GET /api/marketplace/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = UpdateListingSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const prompt = await updateListing(id, parsed.data)
    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('PUT /api/marketplace/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await deleteListing(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/marketplace/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
