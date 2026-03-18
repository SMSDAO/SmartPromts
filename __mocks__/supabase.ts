import { vi } from 'vitest'

const mockSession = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  access_token: 'test-token',
}

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  subscription_tier: 'free',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  usage_count: 0,
  usage_reset_at: new Date().toISOString(),
  banned: false,
}

export const createClient = vi.fn(() => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: mockSession.user }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
}))

export const createServerClient = vi.fn(() => createClient())
export const createBrowserClient = vi.fn(() => createClient())
