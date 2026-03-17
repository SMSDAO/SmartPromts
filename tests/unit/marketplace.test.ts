import { describe, it, expect } from 'vitest'
import {
  calculatePayout,
  validatePrice,
  getPricingTiers,
  CREATOR_SHARE,
  PLATFORM_FEE,
} from '../../core/marketplace/prompt-pricing'
import {
  generateLicense,
  validateLicense,
  LICENSES,
  type LicenseType,
} from '../../core/marketplace/prompt-licensing'

describe('CREATOR_SHARE and PLATFORM_FEE', () => {
  it('sum to 1', () => {
    expect(CREATOR_SHARE + PLATFORM_FEE).toBeCloseTo(1)
  })

  it('creator gets 80%', () => {
    expect(CREATOR_SHARE).toBeCloseTo(0.8)
  })

  it('platform gets 20%', () => {
    expect(PLATFORM_FEE).toBeCloseTo(0.2)
  })
})

describe('calculatePayout', () => {
  it('computes correct creator payout', () => {
    const result = calculatePayout(10, 5)
    expect(result.creator).toBeCloseTo(40)
    expect(result.platform).toBeCloseTo(10)
    expect(result.total).toBeCloseTo(50)
  })

  it('returns zero for zero price', () => {
    const result = calculatePayout(0, 100)
    expect(result.total).toBe(0)
    expect(result.creator).toBe(0)
    expect(result.platform).toBe(0)
  })

  it('returns zero for zero downloads', () => {
    const result = calculatePayout(9.99, 0)
    expect(result.total).toBe(0)
  })
})

describe('validatePrice', () => {
  it('accepts valid prices', () => {
    expect(validatePrice(0).valid).toBe(true)
    expect(validatePrice(4.99).valid).toBe(true)
    expect(validatePrice(9999).valid).toBe(true)
  })

  it('rejects negative prices', () => {
    expect(validatePrice(-1).valid).toBe(false)
    expect(validatePrice(-0.01).valid).toBe(false)
  })

  it('rejects prices above $10,000', () => {
    expect(validatePrice(10001).valid).toBe(false)
  })

  it('accepts boundary value of exactly $10,000', () => {
    expect(validatePrice(10000).valid).toBe(true)
  })
})

describe('getPricingTiers', () => {
  it('returns at least 3 tiers', () => {
    expect(getPricingTiers().length).toBeGreaterThanOrEqual(3)
  })

  it('first tier is free', () => {
    const tiers = getPricingTiers()
    expect(tiers[0].price).toBe(0)
  })

  it('each tier has name, price, description', () => {
    for (const tier of getPricingTiers()) {
      expect(tier.name).toBeTruthy()
      expect(typeof tier.price).toBe('number')
      expect(tier.description).toBeTruthy()
    }
  })
})

describe('generateLicense', () => {
  it('generates a license with correct fields', () => {
    const license = generateLicense('prompt123', 'user456', 'commercial')
    expect(license.id).toMatch(/^lic_/)
    expect(license.prompt_id).toBe('prompt123')
    expect(license.buyer_id).toBe('user456')
    expect(license.type).toBe('commercial')
    expect(license.issued_at).toBeTruthy()
  })
})

describe('validateLicense', () => {
  it('validates a good license', () => {
    const license = generateLicense('p1', 'u1', 'personal')
    expect(validateLicense(license).valid).toBe(true)
  })

  it('rejects expired license', () => {
    const license = generateLicense('p1', 'u1', 'personal')
    const expired = { ...license, expires_at: '2020-01-01T00:00:00Z' }
    expect(validateLicense(expired).valid).toBe(false)
  })

  it('rejects license with missing fields', () => {
    const bad = { id: '', prompt_id: '', buyer_id: '', type: 'personal' as LicenseType, issued_at: '' }
    expect(validateLicense(bad).valid).toBe(false)
  })
})

describe('LICENSES', () => {
  it('contains all 4 license types', () => {
    const types: LicenseType[] = ['personal', 'commercial', 'enterprise', 'open_source']
    for (const t of types) {
      expect(LICENSES).toHaveProperty(t)
    }
  })

  it('open_source requires attribution', () => {
    expect(LICENSES.open_source.requires_attribution).toBe(true)
  })

  it('personal does not allow commercial use', () => {
    expect(LICENSES.personal.allows_commercial).toBe(false)
  })
})
