export async function runWithAnthropic(prompt: string, model: string, apiKey?: string): Promise<{ output: string; tokens: number; latency_ms: number }> {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY
  const start = Date.now()

  if (!key) {
    // Mock response when API key not available
    return {
      output: `[Anthropic ${model} mock response for: ${prompt.slice(0, 50)}...]`,
      tokens: Math.floor(prompt.split(' ').length * 1.3),
      latency_ms: Date.now() - start + 500,
    }
  }

  // Real Anthropic API call via fetch (no SDK to avoid new package dependency)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic API error: ${response.status} ${errText}`)
  }

  const data = await response.json() as {
    content: Array<{ text: string }>
    usage: { input_tokens: number; output_tokens: number }
  }

  return {
    output: data.content[0]?.text ?? '',
    tokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    latency_ms: Date.now() - start,
  }
}
