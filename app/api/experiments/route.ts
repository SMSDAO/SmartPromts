import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createExperiment, listExperiments } from '@/core/experiments/experiment-manager'
import { z } from 'zod'

const CreateExperimentSchema = z.object({
  name: z.string().min(1).max(200),
  prompt_a_id: z.string().min(1),
  prompt_b_id: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const experiments = await listExperiments(session.user.id)
    return NextResponse.json({ experiments })
  } catch (error) {
    console.error('GET /api/experiments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = CreateExperimentSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const experiment = await createExperiment({ ...parsed.data, created_by: session.user.id })
    return NextResponse.json({ experiment }, { status: 201 })
  } catch (error) {
    console.error('POST /api/experiments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
