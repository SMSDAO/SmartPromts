import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getDataset, updateDataset, deleteDataset } from '@/core/benchmarking/dataset-manager'
import { z } from 'zod'

const UpdateDatasetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  input_examples: z.array(z.object({ input: z.string(), context: z.string().optional() })).optional(),
  expected_outputs: z.array(z.string()).optional(),
  category: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dataset = await getDataset(id)
    if (!dataset) return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    return NextResponse.json({ dataset })
  } catch (error) {
    console.error('GET /api/datasets/[id] error:', error)
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
    const parsed = UpdateDatasetSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const dataset = await updateDataset(id, parsed.data)
    return NextResponse.json({ dataset })
  } catch (error) {
    console.error('PUT /api/datasets/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await deleteDataset(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/datasets/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
