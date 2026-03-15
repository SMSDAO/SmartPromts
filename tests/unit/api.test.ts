import { describe, expect, it } from 'vitest'
import { GET } from '../../app/api/health/route'
import type { SubscriptionTier } from '../../lib/auth'
import { USAGE_LIMITS } from '../../lib/usage'

describe('GET /api/health', () => {
  it('returns 200 with required fields', async () => {
    const response = await GET()
    expect(response.status).toBe(200)

    const body = await response.json() as Record<string, unknown>
    expect(body.status).toBe('ok')
    expect(typeof body.version).toBe('string')
    expect(typeof body.timestamp).toBe('string')
    expect(typeof body.latency_ms).toBe('number')
  })

  it('does not expose internal service configuration', async () => {
    const response = await GET()
    const body = await response.json() as Record<string, unknown>

    // Public health endpoint must not leak which services are/aren't configured
    expect(body).not.toHaveProperty('services')
    expect(body).not.toHaveProperty('environment')
    expect(body).not.toHaveProperty('uptime')
  })

  it('response Content-Type is application/json', async () => {
    const response = await GET()
    expect(response.headers.get('content-type')).toContain('application/json')
  })
})

describe('SubscriptionTier completeness', () => {
  it('all 7 tiers are present in USAGE_LIMITS', () => {
    const expectedTiers: SubscriptionTier[] = [
      'free', 'pro', 'enterprise', 'lifetime', 'admin', 'developer', 'auditor',
    ]
    for (const tier of expectedTiers) {
      expect(USAGE_LIMITS).toHaveProperty(tier)
      expect(typeof USAGE_LIMITS[tier]).toBe('number')
    }
  })

  it('developer tier is unlimited', () => {
    expect(USAGE_LIMITS.developer).toBe(-1)
  })

  it('auditor tier limit is less than enterprise', () => {
    // auditor is a limited role; enterprise is unlimited (-1)
    expect(USAGE_LIMITS.auditor).toBeGreaterThan(0)
    expect(USAGE_LIMITS.enterprise).toBe(-1)
  })
})
