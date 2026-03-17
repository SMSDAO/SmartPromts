import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { runBenchmark } from '@/core/benchmarking/benchmark-runner'
import { saveBenchmarkRun } from '@/core/benchmarking/benchmark-storage'
import { getDataset } from '@/core/benchmarking/dataset-manager'
import { z } from 'zod'

const BenchmarkSchema = z.object({
  prompt_id: z.string().min(1),
  prompt: z.string().min(1).max(10000),
  dataset_id: z.string().optional(),
  dataset_examples: z.array(z.object({ input: z.string(), context: z.string().optional() })).optional(),
  expected_outputs: z.array(z.string()).optional(),
  model: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = BenchmarkSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const { prompt_id, prompt, dataset_id, dataset_examples, expected_outputs, model } = parsed.data

    let examples = dataset_examples ?? []
    let expected = expected_outputs ?? []

    if (dataset_id && examples.length === 0) {
      const dataset = await getDataset(dataset_id)
      if (dataset) {
        examples = dataset.input_examples
        expected = dataset.expected_outputs
      }
    }

    if (examples.length === 0) {
      examples = [{ input: 'Test input for benchmarking' }]
      expected = ['Expected test output']
    }

    const result = await runBenchmark(prompt_id, prompt, dataset_id ?? 'adhoc', examples, expected, model)
    await saveBenchmarkRun(result, session.user.id).catch(() => {/* non-blocking */})

    return NextResponse.json({ result })
  } catch (error) {
    console.error('POST /api/benchmark/run error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
