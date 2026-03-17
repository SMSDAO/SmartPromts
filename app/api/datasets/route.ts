import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createDataset, listDatasets } from '@/core/benchmarking/dataset-manager'
import { z } from 'zod'

const CreateDatasetSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  input_examples: z.array(z.object({ input: z.string(), context: z.string().optional() })).min(1),
  expected_outputs: z.array(z.string()),
  category: z.string().default('general'),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const datasets = await listDatasets(session.user.id)
    return NextResponse.json({ datasets })
  } catch (error) {
    console.error('GET /api/datasets error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = CreateDatasetSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const dataset = await createDataset({ ...parsed.data, created_by: session.user.id })
    return NextResponse.json({ dataset }, { status: 201 })
  } catch (error) {
    console.error('POST /api/datasets error:', error)
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
