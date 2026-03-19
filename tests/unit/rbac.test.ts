import { describe, it, expect } from 'vitest'
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
