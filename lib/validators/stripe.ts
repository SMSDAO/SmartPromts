/**
 * Zod schemas for Stripe-related API payloads.
 *
 * Covers checkout session creation and webhook event bodies.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export const CheckoutRequestSchema = z.object({
  /** Stripe Price ID from the dashboard */
  priceId: z.string().min(1, { message: 'priceId is required' }),
  /** Subscription tier identifier (e.g. "pro", "enterprise") */
  tier: z.enum(['free', 'pro', 'enterprise', 'lifetime'], {
    errorMap: () => ({ message: 'tier must be one of: free, pro, enterprise, lifetime' }),
  }),
})

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>

export const CheckoutResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string().url().nullable(),
})

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>

// ---------------------------------------------------------------------------
// Webhook events
// ---------------------------------------------------------------------------

/**
 * Minimal schema for the subset of Stripe webhook event fields we consume.
 * The full event body is verified with Stripe's SDK before parsing.
 */
export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
})

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>

// ---------------------------------------------------------------------------
// Subscription metadata
// ---------------------------------------------------------------------------

export const SubscriptionMetadataSchema = z.object({
  userId: z.string().uuid({ message: 'userId in Stripe metadata must be a valid UUID' }),
  tier: z.enum(['free', 'pro', 'enterprise', 'lifetime']).optional(),
})

export type SubscriptionMetadata = z.infer<typeof SubscriptionMetadataSchema>
