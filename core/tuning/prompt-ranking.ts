export interface RankScore {
  accuracy: number
  format: number
  cost: number
  latency: number
  total: number
}

export function rankScore(accuracy: number, format: number, cost: number, latency: number): RankScore {
  const total = accuracy * 0.5 + format * 0.2 + cost * 0.2 + latency * 0.1
  return { accuracy, format, cost, latency, total }
}

export interface ScoredVariant {
  id: string
  prompt: string
  technique: string
  score: RankScore
}

export function rankVariants(variants: ScoredVariant[]): ScoredVariant[] {
  return [...variants].sort((a, b) => b.score.total - a.score.total)
}
