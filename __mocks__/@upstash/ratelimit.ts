import { vi } from 'vitest'

export const Ratelimit = vi.fn().mockImplementation(() => ({
  limit: vi.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  }),
}))

// Static helper used by some Ratelimit configs
Ratelimit.slidingWindow = vi.fn().mockReturnValue({})
Ratelimit.fixedWindow = vi.fn().mockReturnValue({})
