import OpenAI from 'openai'

export async function runWithOpenAI(prompt: string, model: string, apiKey?: string): Promise<{ output: string; tokens: number; latency_ms: number }> {
  const key = apiKey ?? process.env.OPENAI_API_KEY
  if (!key) throw new Error('OpenAI API key not configured')

  const client = new OpenAI({ apiKey: key })
  const start = Date.now()

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  })

  return {
    output: completion.choices[0]?.message?.content ?? '',
    tokens: completion.usage?.total_tokens ?? 0,
    latency_ms: Date.now() - start,
  }
}
