/**
 * Token Tracker — lightweight token estimation utilities.
 *
 * Uses a simple character-based heuristic (÷4) which approximates
 * GPT tokenisation well enough for cost/usage estimates.
 * For precise counts use the `tiktoken` library.
 */

export interface TokenEstimate {
  count: number
  /** Approximate cost in USD for input tokens at the given rate */
  estimatedCostUsd: number
}

/** Default cost used when no specific model rate is provided (GPT-4o rate) */
const DEFAULT_COST_PER_1K = 0.005

/**
 * Estimate the number of tokens in a string.
 *
 * @param text - The text to estimate tokens for
 * @param costPer1k - Cost per 1K tokens in USD (default: GPT-4o input rate)
 */
export function estimateTokens(
  text: string,
  costPer1k = DEFAULT_COST_PER_1K
): TokenEstimate {
  // GPT tokenisation approximation: ~4 characters per token
  const count = Math.ceil(text.length / 4)
  const estimatedCostUsd = (count / 1000) * costPer1k
  return { count, estimatedCostUsd }
}

/**
 * Estimate tokens for a full chat completion request (system + messages).
 */
export function estimateChatTokens(
  messages: Array<{ role: string; content: string }>,
  costPer1k = DEFAULT_COST_PER_1K
): TokenEstimate {
  const totalText = messages.map((m) => m.content).join(' ')
  // Add ~4 tokens per message for role/separator overhead
  const overhead = messages.length * 4
  const count = Math.ceil(totalText.length / 4) + overhead
  const estimatedCostUsd = (count / 1000) * costPer1k
  return { count, estimatedCostUsd }
}
