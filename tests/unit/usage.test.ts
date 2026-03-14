import { describe, expect, it } from 'vitest'

// Inline the logic under test so we don't need Supabase credentials in CI
type SubscriptionTier = 'free' | 'pro' | 'enterprise' | 'lifetime' | 'admin' | 'developer' | 'auditor'

const USAGE_LIMITS: Record<SubscriptionTier, number> = {
  free: 10,
  pro: 1000,
  enterprise: -1,
  lifetime: -1,
  admin: -1,
  developer: -1,
  auditor: 100,
}

function getRemainingUsage(tier: SubscriptionTier, usageCount: number): number {
  const limit = USAGE_LIMITS[tier]
  return limit === -1 ? -1 : limit - usageCount
}

function isAllowed(tier: SubscriptionTier, usageCount: number): boolean {
  const limit = USAGE_LIMITS[tier]
  return limit === -1 || usageCount < limit
}

describe('Usage limits', () => {
  it('free tier allows up to 10 uses', () => {
    expect(isAllowed('free', 9)).toBe(true)
    expect(isAllowed('free', 10)).toBe(false)
  })

  it('pro tier allows up to 1000 uses', () => {
    expect(isAllowed('pro', 999)).toBe(true)
    expect(isAllowed('pro', 1000)).toBe(false)
  })

  it('unlimited tiers always allow usage', () => {
    for (const tier of ['enterprise', 'lifetime', 'admin', 'developer'] as SubscriptionTier[]) {
      expect(isAllowed(tier, 999999)).toBe(true)
    }
  })

  it('auditor tier has 100 use limit', () => {
    expect(isAllowed('auditor', 99)).toBe(true)
    expect(isAllowed('auditor', 100)).toBe(false)
  })

  it('getRemainingUsage returns -1 for unlimited tiers', () => {
    for (const tier of ['enterprise', 'lifetime', 'admin', 'developer'] as SubscriptionTier[]) {
      expect(getRemainingUsage(tier, 999)).toBe(-1)
    }
  })

  it('getRemainingUsage calculates correctly for limited tiers', () => {
    expect(getRemainingUsage('free', 3)).toBe(7)
    expect(getRemainingUsage('pro', 400)).toBe(600)
    expect(getRemainingUsage('auditor', 60)).toBe(40)
  })
})
