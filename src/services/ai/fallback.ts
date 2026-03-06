/**
 * Fallback utility — wraps an async function with a series of fallback
 * functions that are tried in order if the primary function throws.
 *
 * Useful for AI model fallback chains (e.g. GPT-4 → GPT-4o-mini → cached result).
 */

type AsyncFn<T> = () => Promise<T>

/**
 * Try the primary function, falling back through the provided chain if any
 * step throws. Returns the result of the first successful call.
 *
 * @throws The error from the last fallback if all attempts fail.
 *
 * @example
 * const result = await withFallback(
 *   () => callGpt4Turbo(prompt),
 *   () => callGpt4oMini(prompt),
 *   () => Promise.resolve(getCachedResponse(prompt)),
 * )
 */
export async function withFallback<T>(
  primary: AsyncFn<T>,
  ...fallbacks: AsyncFn<T>[]
): Promise<T> {
  const chain = [primary, ...fallbacks]
  let lastError: unknown

  for (const fn of chain) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}
