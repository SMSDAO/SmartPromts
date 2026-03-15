import { describe, expect, it } from 'vitest'
import { USAGE_LIMITS } from '../../lib/usage'
import type { SubscriptionTier } from '../../lib/auth'

// Pure helpers that mirror the production logic in lib/usage.ts
function getRemainingUsage(tier: SubscriptionTier, usageCount: number): number {
  const limit = USAGE_LIMITS[tier]
  return limit === -1 ? -1 : limit - usageCount
}

function isAllowed(tier: SubscriptionTier, usageCount: number): boolean {
  const limit = USAGE_LIMITS[tier]
  return limit === -1 || usageCount < limit
}

describe('Usage limits (sourced from lib/usage.ts USAGE_LIMITS)', () => {
  it('free tier allows up to 10 uses', () => {
    expect(USAGE_LIMITS.free).toBe(10)
    expect(isAllowed('free', 9)).toBe(true)
    expect(isAllowed('free', 10)).toBe(false)
  })

  it('pro tier allows up to 1000 uses', () => {
    expect(USAGE_LIMITS.pro).toBe(1000)
    expect(isAllowed('pro', 999)).toBe(true)
    expect(isAllowed('pro', 1000)).toBe(false)
  })

  it('unlimited tiers always allow usage', () => {
    const unlimitedTiers: SubscriptionTier[] = ['enterprise', 'lifetime', 'admin', 'developer']
    for (const tier of unlimitedTiers) {
      expect(USAGE_LIMITS[tier]).toBe(-1)
      expect(isAllowed(tier, 999999)).toBe(true)
    }
  })

  it('auditor tier has 100 use limit', () => {
    expect(USAGE_LIMITS.auditor).toBe(100)
    expect(isAllowed('auditor', 99)).toBe(true)
    expect(isAllowed('auditor', 100)).toBe(false)
  })

  it('getRemainingUsage returns -1 for unlimited tiers', () => {
    const unlimitedTiers: SubscriptionTier[] = ['enterprise', 'lifetime', 'admin', 'developer']
    for (const tier of unlimitedTiers) {
      expect(getRemainingUsage(tier, 999)).toBe(-1)
    }
  })

  it('getRemainingUsage calculates correctly for limited tiers', () => {
    expect(getRemainingUsage('free', 3)).toBe(USAGE_LIMITS.free - 3)
    expect(getRemainingUsage('pro', 400)).toBe(USAGE_LIMITS.pro - 400)
    expect(getRemainingUsage('auditor', 60)).toBe(USAGE_LIMITS.auditor - 60)
  })

  it('all 7 subscription tiers are present in USAGE_LIMITS', () => {
    const expected: SubscriptionTier[] = ['free', 'pro', 'enterprise', 'lifetime', 'admin', 'developer', 'auditor']
    for (const tier of expected) {
      expect(USAGE_LIMITS).toHaveProperty(tier)
    }
  })
})
