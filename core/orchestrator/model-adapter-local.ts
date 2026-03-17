export async function runWithLocal(prompt: string, model: string, endpoint?: string): Promise<{ output: string; tokens: number; latency_ms: number }> {
  const baseUrl = endpoint ?? process.env.LOCAL_LLM_ENDPOINT ?? 'http://localhost:11434'
  const start = Date.now()

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    })

    if (!response.ok) {
      throw new Error(`Local model error: ${response.status}`)
    }

    const data = await response.json() as { response: string; eval_count?: number }
    return {
      output: data.response ?? '',
      tokens: data.eval_count ?? Math.floor(prompt.split(' ').length * 1.5),
      latency_ms: Date.now() - start,
    }
  } catch {
    return {
      output: `[Local ${model} unavailable - mock response for: ${prompt.slice(0, 50)}...]`,
      tokens: Math.floor(prompt.split(' ').length * 1.5),
      latency_ms: Date.now() - start,
    }
  }
}
