import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRole, hasRole } from '../../lib/rbac'
import type { RbacUser } from '../../lib/rbac'
import type { SubscriptionTier } from '../../lib/auth'

// ---------------------------------------------------------------------------
// getRole
// ---------------------------------------------------------------------------

describe('getRole', () => {
  it('maps admin tier → admin role', () => {
    expect(getRole('admin')).toBe('admin')
  })

  it('maps developer tier → developer role', () => {
    expect(getRole('developer')).toBe('developer')
  })

  it('maps free tier → user role', () => {
    expect(getRole('free')).toBe('user')
  })

  it('maps pro tier → user role', () => {
    expect(getRole('pro')).toBe('user')
  })

  it('maps enterprise tier → user role', () => {
    expect(getRole('enterprise')).toBe('user')
  })

  it('maps lifetime tier → user role', () => {
    expect(getRole('lifetime')).toBe('user')
  })

  it('maps auditor tier → user role', () => {
    expect(getRole('auditor')).toBe('user')
  })
})

// ---------------------------------------------------------------------------
// hasRole
// ---------------------------------------------------------------------------

function makeUser(tier: SubscriptionTier): RbacUser {
  return { id: 'test-id', subscription_tier: tier }
}

describe('hasRole', () => {
  describe('admin user', () => {
    const admin = makeUser('admin')

    it('is allowed when admin role required', () => {
      expect(hasRole(admin, ['admin'])).toBe(true)
    })

    it('is allowed when admin OR developer role required', () => {
      expect(hasRole(admin, ['admin', 'developer'])).toBe(true)
    })

    it('is NOT allowed when only developer role required', () => {
      expect(hasRole(admin, ['developer'])).toBe(false)
    })

    it('is NOT allowed when only user role required', () => {
      expect(hasRole(admin, ['user'])).toBe(false)
    })
  })

  describe('developer user', () => {
    const dev = makeUser('developer')

    it('is allowed when developer role required', () => {
      expect(hasRole(dev, ['developer'])).toBe(true)
    })

    it('is allowed when admin OR developer role required', () => {
      expect(hasRole(dev, ['admin', 'developer'])).toBe(true)
    })

    it('is NOT allowed when only admin role required', () => {
      expect(hasRole(dev, ['admin'])).toBe(false)
    })

    it('is NOT allowed when only user role required', () => {
      expect(hasRole(dev, ['user'])).toBe(false)
    })
  })

  describe('free/pro/enterprise/lifetime/auditor user', () => {
    const tiers: SubscriptionTier[] = ['free', 'pro', 'enterprise', 'lifetime', 'auditor']

    for (const tier of tiers) {
      it(`${tier} user is allowed when user role required`, () => {
        expect(hasRole(makeUser(tier), ['user'])).toBe(true)
      })

      it(`${tier} user is NOT allowed for admin-only routes`, () => {
        expect(hasRole(makeUser(tier), ['admin'])).toBe(false)
      })

      it(`${tier} user is NOT allowed for developer-only routes`, () => {
        expect(hasRole(makeUser(tier), ['developer'])).toBe(false)
      })
    }
  })

  it('returns false for empty roles array', () => {
    expect(hasRole(makeUser('admin'), [])).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Role hierarchy invariants
// ---------------------------------------------------------------------------

describe('role hierarchy', () => {
  it('admin is more privileged than developer', () => {
    const admin = makeUser('admin')
    const dev = makeUser('developer')

    // Admin can access developer routes
    expect(hasRole(admin, ['admin', 'developer'])).toBe(true)
    // Developer cannot access admin-only routes
    expect(hasRole(dev, ['admin'])).toBe(false)
  })

  it('developer is more privileged than user', () => {
    const dev = makeUser('developer')
    const user = makeUser('free')

    // Developer can access user+developer routes
    expect(hasRole(dev, ['developer', 'user'])).toBe(true)
    // User cannot access developer-only routes
    expect(hasRole(user, ['developer'])).toBe(false)
  })

  it('user role covers all non-privileged tiers', () => {
    const tiers: SubscriptionTier[] = ['free', 'pro', 'enterprise', 'lifetime', 'auditor']
    for (const tier of tiers) {
      expect(hasRole(makeUser(tier), ['user'])).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// enforceRole – via lib/supabase mock
// ---------------------------------------------------------------------------

// Mock lib/supabase so enforceRole never calls cookies() (no Next.js context)
vi.mock('../../lib/supabase', () => {
  const makeDbChain = (resolvedValue: unknown) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
  })

  return {
    createServerSupabaseClient: vi.fn().mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-abc' } } },
          error: null,
        }),
      },
    }),
    createAdminClient: vi.fn(() => ({
      from: vi.fn(() =>
        makeDbChain({ data: { id: 'user-abc', subscription_tier: 'free' }, error: null }),
      ),
    })),
  }
})

describe('enforceRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when there is no active session', async () => {
    const { createServerSupabaseClient } = await import('../../lib/supabase')
    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    } as any)

    const { enforceRole } = await import('../../lib/rbac')
    const handler = vi.fn()
    const protected_ = enforceRole(handler, ['admin'])

    const res = await protected_({ url: 'http://localhost/' } as any)
    expect(res.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
  })

  it('returns 403 when the user lacks the required role', async () => {
    // Session present, but DB returns a free-tier user
    const { createServerSupabaseClient, createAdminClient } = await import('../../lib/supabase')

    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-abc' } } },
          error: null,
        }),
      },
    } as any)

    vi.mocked(createAdminClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-abc', subscription_tier: 'free' },
          error: null,
        }),
      })),
    } as any)

    const { enforceRole } = await import('../../lib/rbac')
    const handler = vi.fn()
    const protected_ = enforceRole(handler, ['admin'])

    const res = await protected_({ url: 'http://localhost/' } as any)
    expect(res.status).toBe(403)
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls handler with the user when role check passes', async () => {
    const { createServerSupabaseClient, createAdminClient } = await import('../../lib/supabase')

    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'admin-abc' } } },
          error: null,
        }),
      },
    } as any)

    vi.mocked(createAdminClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'admin-abc', subscription_tier: 'admin' },
          error: null,
        }),
      })),
    } as any)

    const { enforceRole } = await import('../../lib/rbac')
    const { NextResponse } = await import('next/server')
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
    const protected_ = enforceRole(handler, ['admin'])

    const res = await protected_({ url: 'http://localhost/' } as any)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith(
      expect.anything(),
      { id: 'admin-abc', subscription_tier: 'admin' },
    )
  })

  it('returns 500 when a DB infrastructure error occurs (not missing row)', async () => {
    const { createServerSupabaseClient, createAdminClient } = await import('../../lib/supabase')

    vi.mocked(createServerSupabaseClient).mockResolvedValueOnce({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-xyz' } } },
          error: null,
        }),
      },
    } as any)

    vi.mocked(createAdminClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'DB connection timeout', code: '500' },
        }),
      })),
    } as any)

    const { enforceRole } = await import('../../lib/rbac')
    const handler = vi.fn()
    const protected_ = enforceRole(handler, ['admin'])

    const res = await protected_({ url: 'http://localhost/' } as any)
    expect(res.status).toBe(500)
    expect(handler).not.toHaveBeenCalled()
  })
})
