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
}

export type StripeTier = 'free' | 'pro' | 'enterprise'

export function getTierFromPriceId(priceId: string): StripeTier {
  if (priceId === STRIPE_PRICE_IDS.pro) return 'pro'
  if (priceId === STRIPE_PRICE_IDS.enterprise) return 'enterprise'
  return 'free'
}

export default stripe
