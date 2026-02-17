import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export interface OptimizePromptOptions {
  prompt: string
  model?: string
  context?: string
}

export interface OptimizePromptResult {
  original: string
  optimized: string
  improvements: string[]
  tokensEstimate: number
}

export async function optimizePrompt(
  options: OptimizePromptOptions
): Promise<OptimizePromptResult> {
  if (!openai) {
    throw new Error('OpenAI is not configured')
  }

  const { prompt, model = 'gpt-4', context = '' } = options

  const systemPrompt = `You are an expert AI prompt engineer. Your task is to optimize prompts for clarity, effectiveness, and token efficiency.

Analyze the given prompt and:
1. Improve clarity and specificity
2. Add relevant context or constraints if needed
3. Optimize for the target model (${model})
4. Reduce unnecessary verbosity while maintaining intent
5. Ensure the prompt follows best practices

Provide your response as a JSON object with:
- "optimized": the improved prompt
- "improvements": array of key changes made
- "tokensEstimate": estimated token count`

  const userPrompt = context
    ? `Context: ${context}\n\nPrompt to optimize: ${prompt}`
    : `Prompt to optimize: ${prompt}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      original: prompt,
      optimized: result.optimized || prompt,
      improvements: result.improvements || [],
      tokensEstimate: result.tokensEstimate || 0,
    }
  } catch (error: unknown) {
    console.error('OpenAI API error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to optimize prompt: ${error.message}`)
    }
    throw new Error(`Failed to optimize prompt: ${String(error)}`)
  }
}

export default openai
