import OpenAI from 'openai'

export interface SingleResult {
  input: string
  expected: string
  actual: string
  score: number
  latency_ms: number
  tokens: number
}

export interface BenchmarkResult {
  dataset_id: string
  prompt_id: string
  score: number
  latency_avg: number
  token_cost: number
  success_rate: number
  results: SingleResult[]
}

import { calculateAccuracy, calculateBenchmarkScore } from './benchmark-metrics'

export async function runBenchmark(
  promptId: string,
  prompt: string,
  datasetId: string,
  examples: Array<{ input: string; context?: string }>,
  expected: string[],
  model = 'gpt-3.5-turbo'
): Promise<BenchmarkResult> {
  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null

  const results: SingleResult[] = []

  for (let i = 0; i < examples.length; i++) {
    const example = examples[i]
    const expectedOutput = expected[i] ?? ''
    const start = Date.now()
    let actual = ''
    let tokens = 0

    if (openai) {
      try {
        const userContent = example.context
          ? `Context: ${example.context}\n\nInput: ${example.input}`
          : example.input

        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: userContent },
          ],
          max_tokens: 500,
        })
        actual = completion.choices[0]?.message?.content ?? ''
        tokens = completion.usage?.total_tokens ?? 0
      } catch {
        actual = ''
        tokens = 0
      }
    } else {
      actual = `[mock output for: ${example.input}]`
      tokens = Math.floor(example.input.split(' ').length * 1.5)
    }

    const latency_ms = Date.now() - start
    const score = calculateAccuracy(expectedOutput, actual)
    results.push({ input: example.input, expected: expectedOutput, actual, score, latency_ms, tokens })
  }

  const agg = calculateBenchmarkScore(results)
  const tokenCostPerToken = 0.000002 // ~$0.002 per 1k tokens for gpt-3.5
  return {
    dataset_id: datasetId,
    prompt_id: promptId,
    score: agg.avg_score,
    latency_avg: agg.avg_latency,
    token_cost: agg.avg_tokens * tokenCostPerToken,
    success_rate: agg.success_rate,
    results,
  }
}
