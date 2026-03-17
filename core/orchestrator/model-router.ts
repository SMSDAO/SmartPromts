import { listModels, getModel, type ModelInfo } from './model-registry'

export type RoutingStrategy = 'lowest_cost' | 'lowest_latency' | 'highest_accuracy' | 'best_score' | 'manual'

export function selectModel(strategy: RoutingStrategy, candidates: ModelInfo[]): ModelInfo {
  if (candidates.length === 0) throw new Error('No candidate models available')

  switch (strategy) {
    case 'lowest_cost':
      return candidates.reduce((best, m) => m.cost_per_token < best.cost_per_token ? m : best)
    case 'lowest_latency':
      return candidates.reduce((best, m) => m.latency_estimate < best.latency_estimate ? m : best)
    case 'highest_accuracy':
      return candidates.reduce((best, m) => m.accuracy_score > best.accuracy_score ? m : best)
    case 'best_score': {
      // Composite: normalise each metric and sum
      const scored = candidates.map(m => ({
        model: m,
        score:
          m.accuracy_score * 0.5 +
          (1 - m.cost_per_token / 0.00003) * 0.3 +
          (1 - m.latency_estimate / 3000) * 0.2,
      }))
      return scored.reduce((best, s) => s.score > best.score ? s : best).model
    }
    default:
      return candidates[0]
  }
}

export function routePrompt(prompt: string, strategy: RoutingStrategy, overrideModel?: string): string {
  if (strategy === 'manual' && overrideModel) return overrideModel
  const candidates = listModels()
  const selected = selectModel(strategy, candidates)
  return selected.name
}
