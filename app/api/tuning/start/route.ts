import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { runTuning } from '@/core/tuning/tuning-runner'
import { z } from 'zod'

const TuningSchema = z.object({
  prompt_id: z.string().min(1),
  prompt: z.string().min(1).max(10000),
  dataset_id: z.string().optional(),
  iterations: z.number().int().min(1).max(10).optional(),
  model: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = TuningSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const { prompt_id, prompt, dataset_id, iterations, model } = parsed.data
    const result = await runTuning(prompt_id, prompt, dataset_id, iterations, model)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('POST /api/tuning/start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
