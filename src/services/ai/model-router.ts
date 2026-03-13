/**
 * Model Router — selects the appropriate AI model based on task requirements,
 * user tier, and current availability.
 */

export interface ModelConfig {
  id: string
  name: string
  contextWindow: number
  /** Cost per 1K input tokens in USD */
  inputCostPer1k: number
  /** Cost per 1K output tokens in USD */
  outputCostPer1k: number
  /** Minimum subscription tier required */
  minTier: 'free' | 'pro' | 'lifetime' | 'enterprise' | 'admin'
  /** Whether the model supports JSON mode */
  supportsJsonMode: boolean
  /** Whether the model is available (can be toggled for maintenance) */
  available: boolean
  /**
   * Capability rank — higher is better. Used by routeModel to select the
   * most capable model available for a given tier when no specific model
   * is requested.
   */
  priority: number
}

export const SUPPORTED_MODELS: Record<string, ModelConfig> = {
  'gpt-4-turbo-preview': {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    contextWindow: 128000,
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03,
    minTier: 'pro',
    supportsJsonMode: true,
    available: true,
    priority: 3,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    contextWindow: 128000,
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.015,
    minTier: 'pro',
    supportsJsonMode: true,
    available: true,
    priority: 4,
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    contextWindow: 128000,
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    minTier: 'free',
    supportsJsonMode: true,
    available: true,
    priority: 2,
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    contextWindow: 16385,
    inputCostPer1k: 0.0005,
    outputCostPer1k: 0.0015,
    minTier: 'free',
    supportsJsonMode: true,
    available: true,
    priority: 1,
  },
}

const TIER_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  lifetime: 2,
  enterprise: 3,
  admin: 4,
}

/**
 * Select the most capable available model for the given user tier.
 * Falls back to gpt-4o-mini if the requested model is unavailable or
 * requires a higher tier.
 */
export function routeModel(
  requestedModel: string | undefined,
  userTier: string
): ModelConfig {
  const userRank = TIER_RANK[userTier] ?? 0

  // Use the requested model if it exists, is available, and the user has access
  if (requestedModel) {
    const config = SUPPORTED_MODELS[requestedModel]
    if (config && config.available && TIER_RANK[config.minTier] <= userRank) {
      return config
    }
  }

  // Default: highest-priority model available for this tier
  const available = Object.values(SUPPORTED_MODELS)
    .filter((m) => m.available && TIER_RANK[m.minTier] <= userRank)
    .sort((a, b) => b.priority - a.priority)

  return available[0] ?? SUPPORTED_MODELS['gpt-4o-mini']
}
