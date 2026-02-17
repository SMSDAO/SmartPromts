import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null

export const STRIPE_PRICE_IDS = {
  free: process.env.STRIPE_PRICE_ID_FREE || '',
  pro: process.env.STRIPE_PRICE_ID_PRO || '',
  enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
  lifetime: process.env.STRIPE_PRICE_ID_LIFETIME || '',
}

export type StripeTier = 'free' | 'pro' | 'enterprise' | 'lifetime'

export function getTierFromPriceId(priceId: string): StripeTier {
  // Validate that price IDs are configured
  if (!STRIPE_PRICE_IDS.pro && !STRIPE_PRICE_IDS.enterprise && !STRIPE_PRICE_IDS.lifetime) {
    throw new Error('Stripe price IDs are not configured')
  }

  if (priceId === STRIPE_PRICE_IDS.pro) return 'pro'
  if (priceId === STRIPE_PRICE_IDS.enterprise) return 'enterprise'
  if (priceId === STRIPE_PRICE_IDS.lifetime) return 'lifetime'
  
  // Don't default to free for unrecognized price IDs
  if (priceId === STRIPE_PRICE_IDS.free) return 'free'
  
  throw new Error(`Unrecognized Stripe price ID: ${priceId}`)
}

export default stripe
