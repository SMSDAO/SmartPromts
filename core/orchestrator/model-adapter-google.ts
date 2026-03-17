export async function runWithGoogle(prompt: string, model: string, apiKey?: string): Promise<{ output: string; tokens: number; latency_ms: number }> {
  const key = apiKey ?? process.env.GOOGLE_AI_API_KEY
  const start = Date.now()

  if (!key) {
    return {
      output: `[Google ${model} mock response for: ${prompt.slice(0, 50)}...]`,
      tokens: Math.floor(prompt.split(' ').length * 1.2),
      latency_ms: Date.now() - start + 400,
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Google AI API error: ${response.status} ${errText}`)
  }

  const data = await response.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>
    usageMetadata?: { totalTokenCount: number }
  }

  return {
    output: data.candidates[0]?.content?.parts[0]?.text ?? '',
    tokens: data.usageMetadata?.totalTokenCount ?? 0,
    latency_ms: Date.now() - start,
  }
}
