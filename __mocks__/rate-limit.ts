import { vi } from 'vitest'

export const Ratelimit = vi.fn().mockImplementation(() => ({
  limit: vi.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  }),
}))

export const checkRateLimit = vi.fn().mockResolvedValue({
  allowed: true,
  remaining: 9,
  resetAt: new Date(Date.now() + 60000),
})
