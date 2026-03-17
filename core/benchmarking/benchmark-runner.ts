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

// Basic detection for whether a given model name is likely an OpenAI model.
// This helps avoid sending clearly non-OpenAI model identifiers (e.g., Claude/Gemini)
// to the OpenAI SDK, which would otherwise result in failed requests and empty outputs.
const OPENAI_MODEL_PREFIXES = ['gpt-', 'o'];

function isOpenAIModel(model: string): boolean {
  return OPENAI_MODEL_PREFIXES.some((prefix) => model.startsWith(prefix));
}

// Approximate per-token pricing registry (USD per token) for known models.
// These values are intentionally simple and can be updated to align with a
// central model registry if available elsewhere in the codebase.
const MODEL_TOKEN_COST_PER_TOKEN: Record<string, number> = {
  // GPT-3.5 family (e.g., gpt-3.5-turbo)
  'gpt-3.5-turbo': 0.000002, // ~$0.002 per 1k tokens
  // GPT-4 / GPT-4 Turbo examples (values are illustrative)
  'gpt-4': 0.00003, // ~$0.03 per 1k tokens
  'gpt-4-turbo': 0.00001, // ~$0.01 per 1k tokens
};

function getTokenCostPerToken(model: string): number {
  // Prefer an exact match; if unavailable, try to match by prefix;
  // finally, fall back to a sensible default (gpt-3.5 pricing).
  if (MODEL_TOKEN_COST_PER_TOKEN[model] !== undefined) {
    return MODEL_TOKEN_COST_PER_TOKEN[model];
  }

  const prefixMatch = Object.keys(MODEL_TOKEN_COST_PER_TOKEN).find((knownModel) =>
    model.startsWith(knownModel)
  );
  if (prefixMatch) {
    return MODEL_TOKEN_COST_PER_TOKEN[prefixMatch];
  }

  // Default: use gpt-3.5-turbo pricing as a conservative fallback.
  return MODEL_TOKEN_COST_PER_TOKEN['gpt-3.5-turbo'];
}

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

    // Only attempt to call the OpenAI API when we both have a client and the
    // requested model is recognizable as an OpenAI model. This prevents
    // sending non-OpenAI model identifiers (e.g., Claude/Gemini) to the
    // OpenAI SDK, which would otherwise result in failed requests and empty
    // outputs that distort benchmark scores.
    if (openai && isOpenAIModel(model)) {
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
      // For non-OpenAI models or when no OpenAI API key is configured, fall
      // back to the mock behavior so that benchmarking can still proceed
      // without external provider calls from this module.
      actual = `[mock output for: ${example.input}]`
      tokens = Math.floor(example.input.split(' ').length * 1.5)
    }

    const latency_ms = Date.now() - start
    const score = calculateAccuracy(expectedOutput, actual)
    results.push({ input: example.input, expected: expectedOutput, actual, score, latency_ms, tokens })
  }

  const agg = calculateBenchmarkScore(results)
  const tokenCostPerToken = getTokenCostPerToken(model)
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
