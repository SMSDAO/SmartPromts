export function calculateAccuracy(expected: string, actual: string): number {
  if (!expected || !actual) return 0
  const exp = expected.trim().toLowerCase()
  const act = actual.trim().toLowerCase()
  if (exp === act) return 1
  // Partial match based on word overlap
  const expWords = new Set(exp.split(/\s+/))
  const actWords = act.split(/\s+/)
  const matches = actWords.filter(w => expWords.has(w)).length
  return Math.min(matches / Math.max(expWords.size, 1), 1)
}

export function calculateSemanticSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length
  const union = new Set([...wordsA, ...wordsB]).size
  return union === 0 ? 0 : intersection / union
}

export function calculateHallucinationRisk(expected: string, actual: string): number {
  if (!expected || !actual) return 1
  const expWords = new Set(expected.toLowerCase().split(/\s+/))
  const actWords = actual.toLowerCase().split(/\s+/)
  const hallucinated = actWords.filter(w => !expWords.has(w)).length
  const total = actWords.length
  return total === 0 ? 0 : 1 - hallucinated / total
}

export interface SingleBenchmarkResult {
  score: number
  latency_ms: number
  tokens: number
}

export function calculateBenchmarkScore(results: SingleBenchmarkResult[]): {
  avg_score: number
  avg_latency: number
  avg_tokens: number
  success_rate: number
} {
  if (results.length === 0) {
    return { avg_score: 0, avg_latency: 0, avg_tokens: 0, success_rate: 0 }
  }
  const avg_score = results.reduce((s, r) => s + r.score, 0) / results.length
  const avg_latency = results.reduce((s, r) => s + r.latency_ms, 0) / results.length
  const avg_tokens = results.reduce((s, r) => s + r.tokens, 0) / results.length
  const success_rate = results.filter(r => r.score > 0.5).length / results.length
  return { avg_score, avg_latency, avg_tokens, success_rate }
}
