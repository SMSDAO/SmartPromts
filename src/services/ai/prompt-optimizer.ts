/**
 * Prompt Optimizer — enhanced wrapper around the OpenAI API with
 * model routing and validation support.
 */

import { routeModel } from './model-router'
import { estimateTokens } from './token-tracker'

export interface OptimizeOptions {
  prompt: string
  model?: string
  context?: string
  userTier?: string
}

export interface OptimizeResult {
  original: string
  optimized: string
  improvements: string[]
  tokensEstimate: number
  modelUsed: string
}

const SYSTEM_PROMPT = `You are an expert AI prompt engineer. Your task is to optimize prompts for clarity, effectiveness, and token efficiency.

Analyze the given prompt and:
1. Improve clarity and specificity
2. Add relevant context or constraints if needed
3. Optimize for the target model
4. Reduce unnecessary verbosity while maintaining intent
5. Ensure the prompt follows best practices

Respond with a JSON object containing:
- "optimized": the improved prompt
- "improvements": array of key changes made
- "tokensEstimate": estimated token count of the optimized prompt`

/**
 * Optimize a prompt using the appropriate model for the user's tier.
 * This function is the primary entry point for the AI service layer.
 */
export async function optimizePrompt(
  options: OptimizeOptions
): Promise<OptimizeResult> {
  const { prompt, model: requestedModel, context, userTier = 'free' } = options

  const modelConfig = routeModel(requestedModel, userTier)

  // Dynamic import to avoid loading OpenAI in contexts where it's not needed
  const { default: openai } = await import('@/lib/openai')

  if (!openai) {
    throw new Error('OpenAI is not configured — set OPENAI_API_KEY')
  }

  const userMessage = context
    ? `Context: ${context}\n\nPrompt to optimize: ${prompt}`
    : `Prompt to optimize: ${prompt}`

  const completion = await openai.chat.completions.create({
    model: modelConfig.id,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices?.[0]?.message?.content
  let raw: {
    optimized?: string
    improvements?: string[]
    tokensEstimate?: number
  }

  try {
    raw = content ? (JSON.parse(content) as typeof raw) : {}
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown JSON parse error'
    throw new Error(
      `Failed to parse OpenAI prompt optimizer response as JSON: ${message}`
    )
  }
  return {
    original: prompt,
    optimized: raw.optimized ?? prompt,
    improvements: raw.improvements ?? [],
    tokensEstimate: raw.tokensEstimate ?? estimateTokens(raw.optimized ?? prompt).count,
    modelUsed: modelConfig.id,
  }
}
