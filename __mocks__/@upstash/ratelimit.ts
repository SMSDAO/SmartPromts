import { vi } from 'vitest'

const RatelimitMock = vi.fn().mockImplementation(() => ({
  limit: vi.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  }),
}))

// Attach static factory methods used by Ratelimit algorithm configs
export const Ratelimit = Object.assign(RatelimitMock, {
  slidingWindow: vi.fn().mockReturnValue({}),
  fixedWindow: vi.fn().mockReturnValue({}),
})
