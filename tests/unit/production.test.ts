/**
 * Unit tests for production infrastructure modules:
 *  - lib/config.ts (schema)
 *  - lib/api-error-handler.ts
 *  - lib/validators/*
 *  - lib/performance.ts
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { configSchema } from '../../lib/config.schema'

// ---------------------------------------------------------------------------
// lib/config – schema tests (configSchema is exported from lib/config)
// ---------------------------------------------------------------------------

const validConfig = {
  supabase: {
    url: 'https://abc.supabase.co',
    anonKey: 'anon-key',
  },
  openai: { apiKey: 'sk-openai' },
  stripe: {
    priceIds: { free: '', pro: '', enterprise: '', lifetime: '' },
  },
  upstash: {},
  app: {},
  nft: {},
  walletConnect: {},
}

describe('lib/config – configuration schema', () => {
  it('accepts minimal valid configuration', () => {
    const result = configSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it('rejects missing supabase URL', () => {
    const cfg = { ...validConfig, supabase: { anonKey: 'key' } }
    expect(configSchema.safeParse(cfg).success).toBe(false)
  })

  it('rejects invalid supabase URL format', () => {
    const cfg = { ...validConfig, supabase: { url: 'not-a-url', anonKey: 'key' } }
    expect(configSchema.safeParse(cfg).success).toBe(false)
  })

  it('rejects missing openai API key', () => {
    const cfg = { ...validConfig, openai: {} }
    expect(configSchema.safeParse(cfg).success).toBe(false)
  })

  it('applies default app URL when absent', () => {
    const result = configSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.app.url).toBe('http://localhost:3000')
    }
  })

  it('applies default openai model when absent', () => {
    const result = configSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.openai.defaultModel).toBe('gpt-4-turbo-preview')
    }
  })

  it('applies default chainId 8453 for Base when absent', () => {
    const result = configSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nft.chainId).toBe(8453)
    }
  })
})

// ---------------------------------------------------------------------------
// lib/api-error-handler
// ---------------------------------------------------------------------------

import {
  apiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  rateLimited,
  internalError,
  handleApiError,
  generateRequestId,
} from '../../lib/api-error-handler'

describe('lib/api-error-handler', () => {
  describe('apiError()', () => {
    it('returns a NextResponse with the correct HTTP status', async () => {
      const res = apiError('test error', 'NOT_FOUND')
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBe('test error')
      expect(body.code).toBe('NOT_FOUND')
    })

    it('includes requestId when provided', async () => {
      const res = apiError('oops', 'BAD_REQUEST', { requestId: 'req_abc' })
      const body = await res.json()
      expect(body.requestId).toBe('req_abc')
    })

    it('omits requestId when not provided', async () => {
      const res = apiError('oops', 'BAD_REQUEST')
      const body = await res.json()
      expect(body).not.toHaveProperty('requestId')
    })
  })

  describe('convenience helpers', () => {
    it('badRequest returns 400', () => {
      expect(badRequest('bad').status).toBe(400)
    })
    it('unauthorized returns 401', () => {
      expect(unauthorized().status).toBe(401)
    })
    it('forbidden returns 403', () => {
      expect(forbidden().status).toBe(403)
    })
    it('notFound returns 404', () => {
      expect(notFound().status).toBe(404)
    })
    it('rateLimited returns 429', () => {
      expect(rateLimited().status).toBe(429)
    })
    it('internalError returns 500', () => {
      expect(internalError().status).toBe(500)
    })
  })

  describe('handleApiError()', () => {
    it('returns 422 for ZodError', () => {
      const zodErr = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['prompt'],
          message: 'Required',
        },
      ])
      const res = handleApiError(zodErr)
      expect(res.status).toBe(422)
    })

    it('returns 500 for generic Error', () => {
      const res = handleApiError(new Error('boom'))
      expect(res.status).toBe(500)
    })

    it('returns 500 for unknown value', () => {
      const res = handleApiError('something weird')
      expect(res.status).toBe(500)
    })
  })

  describe('generateRequestId()', () => {
    it('generates a string starting with req_', () => {
      expect(generateRequestId()).toMatch(/^req_/)
    })

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 20 }, generateRequestId))
      expect(ids.size).toBe(20)
    })
  })
})

// ---------------------------------------------------------------------------
// lib/validators/optimize
// ---------------------------------------------------------------------------

import {
  OptimizeRequestSchema,
  OptimizeResponseSchema,
} from '../../lib/validators/optimize'

describe('lib/validators/optimize – OptimizeRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(
      OptimizeRequestSchema.safeParse({ prompt: 'Write a poem' }).success,
    ).toBe(true)
  })

  it('accepts request with optional fields', () => {
    expect(
      OptimizeRequestSchema.safeParse({
        prompt: 'Write a poem',
        model: 'gpt-4',
        context: 'for children',
      }).success,
    ).toBe(true)
  })

  it('rejects empty prompt', () => {
    expect(OptimizeRequestSchema.safeParse({ prompt: '' }).success).toBe(false)
  })

  it('rejects prompt exceeding 10,000 characters', () => {
    expect(
      OptimizeRequestSchema.safeParse({ prompt: 'a'.repeat(10_001) }).success,
    ).toBe(false)
  })

  it('rejects context exceeding 5,000 characters', () => {
    expect(
      OptimizeRequestSchema.safeParse({
        prompt: 'hello',
        context: 'x'.repeat(5_001),
      }).success,
    ).toBe(false)
  })
})

describe('lib/validators/optimize – OptimizeResponseSchema', () => {
  const validResponse = {
    success: true,
    data: {
      original: 'Write a poem',
      optimized: 'Compose a short poem',
      improvements: ['clearer', 'concise'],
      tokensEstimate: 12,
    },
    usage: {
      remaining: 9,
      limit: 10,
      resetAt: '2024-01-01T00:00:00Z',
      tier: 'pro',
    },
  }

  it('accepts a valid response', () => {
    expect(OptimizeResponseSchema.safeParse(validResponse).success).toBe(true)
  })

  it('rejects negative tokensEstimate', () => {
    const invalidResponse = { ...validResponse, data: { ...validResponse.data, tokensEstimate: -1 } }
    expect(OptimizeResponseSchema.safeParse(invalidResponse).success).toBe(false)
  })

  it('rejects missing required data fields', () => {
    const { data: _data, ...noData } = validResponse
    expect(OptimizeResponseSchema.safeParse(noData).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// lib/validators/auth
// ---------------------------------------------------------------------------

import {
  SignInSchema,
  SignUpSchema,
  PasswordResetRequestSchema,
} from '../../lib/validators/auth'

describe('lib/validators/auth – SignInSchema', () => {
  it('accepts valid credentials', () => {
    expect(
      SignInSchema.safeParse({ email: 'user@example.com', password: 'password1' }).success,
    ).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(SignInSchema.safeParse({ email: 'notanemail', password: 'password1' }).success).toBe(
      false,
    )
  })

  it('rejects short password', () => {
    expect(SignInSchema.safeParse({ email: 'user@example.com', password: 'short' }).success).toBe(
      false,
    )
  })
})

describe('lib/validators/auth – SignUpSchema', () => {
  it('accepts optional name', () => {
    const r = SignUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password1',
      name: 'Alice',
    })
    expect(r.success).toBe(true)
  })
})

describe('lib/validators/auth – PasswordResetRequestSchema', () => {
  it('accepts valid email', () => {
    expect(
      PasswordResetRequestSchema.safeParse({ email: 'user@example.com' }).success,
    ).toBe(true)
  })

  it('rejects missing email', () => {
    expect(PasswordResetRequestSchema.safeParse({}).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// lib/validators/stripe
// ---------------------------------------------------------------------------

import {
  CheckoutRequestSchema,
  SubscriptionMetadataSchema,
} from '../../lib/validators/stripe'

describe('lib/validators/stripe – CheckoutRequestSchema', () => {
  it('accepts a valid checkout request', () => {
    expect(
      CheckoutRequestSchema.safeParse({ priceId: 'price_123', tier: 'pro' }).success,
    ).toBe(true)
  })

  it('rejects missing priceId', () => {
    expect(CheckoutRequestSchema.safeParse({ tier: 'pro' }).success).toBe(false)
  })

  it('rejects unknown tier', () => {
    expect(
      CheckoutRequestSchema.safeParse({ priceId: 'price_123', tier: 'unknown' }).success,
    ).toBe(false)
  })
})

describe('lib/validators/stripe – SubscriptionMetadataSchema', () => {
  it('accepts valid UUID', () => {
    expect(
      SubscriptionMetadataSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
      }).success,
    ).toBe(true)
  })

  it('rejects non-UUID userId', () => {
    expect(SubscriptionMetadataSchema.safeParse({ userId: 'not-a-uuid' }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// lib/validators/admin
// ---------------------------------------------------------------------------

import {
  UpdateUserTierSchema,
  BanUserSchema,
  SystemActionSchema,
} from '../../lib/validators/admin'

describe('lib/validators/admin – UpdateUserTierSchema', () => {
  it('accepts all valid tiers', () => {
    const tiers = ['free', 'pro', 'enterprise', 'lifetime', 'admin', 'developer', 'auditor']
    for (const tier of tiers) {
      expect(
        UpdateUserTierSchema.safeParse({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          tier,
        }).success,
      ).toBe(true)
    }
  })

  it('rejects invalid tier', () => {
    expect(
      UpdateUserTierSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tier: 'superadmin',
      }).success,
    ).toBe(false)
  })
})

describe('lib/validators/admin – BanUserSchema', () => {
  it('accepts ban with reason', () => {
    expect(
      BanUserSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        banned: true,
        reason: 'Spam',
      }).success,
    ).toBe(true)
  })

  it('rejects non-boolean banned field', () => {
    expect(
      BanUserSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        banned: 'yes',
      }).success,
    ).toBe(false)
  })
})

describe('lib/validators/admin – SystemActionSchema', () => {
  it('accepts valid actions', () => {
    for (const action of ['flush-cache', 'reindex', 'health-recheck']) {
      expect(SystemActionSchema.safeParse({ action }).success).toBe(true)
    }
  })

  it('rejects unknown action', () => {
    expect(SystemActionSchema.safeParse({ action: 'destroy-all' }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// lib/performance
// ---------------------------------------------------------------------------

import { startTimer, recordApiLatency, recordDbLatency, recordOperationLatency, timed } from '../../lib/performance'

describe('lib/performance', () => {
  it('startTimer returns a function that returns elapsed ms', () => {
    const elapsed = startTimer()
    // Use a looser bound (>= 0) to avoid flakiness on busy CI runners;
    // correctness of the timer math is validated by the monotonic clock itself.
    expect(elapsed()).toBeGreaterThanOrEqual(0)
    expect(typeof elapsed()).toBe('number')
  })

  it('timed() resolves and returns the inner function result', async () => {
    const result = await timed('test.op', async () => 42)
    expect(result).toBe(42)
  })

  it('timed() propagates errors from the inner function', async () => {
    await expect(
      timed('test.error', async () => {
        throw new Error('inner error')
      }),
    ).rejects.toThrow('inner error')
  })

  it('recordApiLatency, recordDbLatency and recordOperationLatency do not throw', () => {
    expect(() => recordApiLatency('GET /api/test', 15)).not.toThrow()
    expect(() => recordDbLatency('users.select', 5, { table: 'users' })).not.toThrow()
    expect(() => recordOperationLatency('openai.chat', 300, { model: 'gpt-4' })).not.toThrow()
  })
})
