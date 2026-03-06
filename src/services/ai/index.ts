/**
 * AI Service Layer — SmartPromts
 *
 * Re-exports all AI service modules for convenient importing.
 *
 * @example
 * import { routeModel, optimizeWithFallback } from '@/src/services/ai'
 */

export { routeModel, SUPPORTED_MODELS, type ModelConfig } from './model-router'
export { optimizePrompt as optimizeWithFallback, type OptimizeOptions, type OptimizeResult } from './prompt-optimizer'
export { estimateTokens, type TokenEstimate } from './token-tracker'
export { checkAIRateLimit, type AIRateLimitResult } from './rate-limiter'
export { withFallback } from './fallback'
