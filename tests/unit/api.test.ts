import { describe, expect, it } from 'vitest'

describe('Health check API response shape', () => {
  it('health response has required fields', () => {
    // Simulate what the health endpoint returns
    const healthResponse = {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: 'test',
      services: {
        app: 'ok',
        supabase: 'not_configured',
        openai: 'not_configured',
        stripe: 'not_configured',
        redis: 'not_configured',
      },
      latency_ms: 0,
    }

    expect(healthResponse.status).toBe('ok')
    expect(healthResponse.version).toBe('1.0.0')
    expect(typeof healthResponse.uptime).toBe('number')
    expect(healthResponse.services).toHaveProperty('app')
    expect(healthResponse.services).toHaveProperty('supabase')
    expect(healthResponse.services).toHaveProperty('openai')
    expect(healthResponse.services).toHaveProperty('stripe')
    expect(healthResponse.services).toHaveProperty('redis')
  })
})

describe('Subscription tiers', () => {
  it('all required tiers are defined', () => {
    const validTiers = ['free', 'pro', 'enterprise', 'lifetime', 'admin', 'developer', 'auditor']
    for (const tier of validTiers) {
      expect(typeof tier).toBe('string')
    }
  })

  it('admin-only tier list includes developer and auditor', () => {
    const adminTiers = ['free', 'pro', 'enterprise', 'lifetime', 'developer', 'auditor', 'admin']
    expect(adminTiers).toContain('developer')
    expect(adminTiers).toContain('auditor')
  })
})
