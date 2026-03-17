import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { purchasePrompt } from '@/core/marketplace/prompt-purchase'
import { z } from 'zod'

const PurchaseSchema = z.object({
  license_type: z.enum(['personal', 'commercial', 'enterprise', 'open_source']).default('personal'),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = PurchaseSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const purchase = await purchasePrompt(id, session.user.id, parsed.data.license_type)
    return NextResponse.json({ purchase }, { status: 201 })
  } catch (error) {
    console.error('POST /api/marketplace/[id]/purchase error:', error)
    if (error instanceof Error && error.message === 'Prompt not found') {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
