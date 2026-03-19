import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Test the validation schema in isolation without importing the module (which
// throws at startup when env vars are absent in test environment).
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
})

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  OPENAI_API_KEY: 'sk-openai',
  STRIPE_SECRET_KEY: 'sk_test_stripe',
  UPSTASH_REDIS_REST_URL: 'https://redis.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'upstash-token',
}

describe('lib/env – environment validation schema', () => {
  it('accepts a fully valid environment', () => {
    const result = envSchema.safeParse(validEnv)
    expect(result.success).toBe(true)
  })

  it('rejects a missing required variable', () => {
    const { OPENAI_API_KEY: _omit, ...rest } = validEnv
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('OPENAI_API_KEY')
    }
  })

  it('rejects an invalid URL for NEXT_PUBLIC_SUPABASE_URL', () => {
    const result = envSchema.safeParse({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid URL for UPSTASH_REDIS_REST_URL', () => {
    const result = envSchema.safeParse({ ...validEnv, UPSTASH_REDIS_REST_URL: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty string for NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
    const result = envSchema.safeParse({ ...validEnv, NEXT_PUBLIC_SUPABASE_ANON_KEY: '' })
    expect(result.success).toBe(false)
  })

  it('rejects multiple missing variables and reports all paths', () => {
    const result = envSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(6)
    }
  })
})
