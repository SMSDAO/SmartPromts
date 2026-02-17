'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Zap } from 'lucide-react'
import { STRIPE_PRICE_IDS } from '@/lib/stripe'

const tiers = [
  {
    name: 'Free',
    id: 'free',
    priceId: STRIPE_PRICE_IDS.free,
    price: '$0',
    description: 'Get started with basic features',
    features: [
      '10 optimizations per month',
      'Basic prompt optimization',
      'Email support',
      'All AI models',
    ],
  },
  {
    name: 'Pro',
    id: 'pro',
    priceId: STRIPE_PRICE_IDS.pro,
    price: '$29',
    description: 'Perfect for professionals',
    features: [
      '1,000 optimizations per month',
      'Advanced optimization algorithms',
      'Priority support',
      'All AI models',
      'Usage analytics',
      'Custom contexts',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceId: STRIPE_PRICE_IDS.enterprise,
    price: '$99',
    description: 'For teams and businesses',
    features: [
      'Unlimited optimizations',
      'Advanced optimization algorithms',
      '24/7 priority support',
      'All AI models',
      'Usage analytics',
      'Custom contexts',
      'API access',
      'Team management',
    ],
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  
  // Check if Stripe is configured
  const isStripeConfigured = STRIPE_PRICE_IDS.pro && STRIPE_PRICE_IDS.enterprise

  const handleSubscribe = async (priceId: string, tier: string) => {
    if (tier === 'free') {
      window.location.href = '/login'
      return
    }

    if (!isStripeConfigured || !priceId) {
      alert('Stripe billing is not configured. Please contact support.')
      return
    }

    setLoading(tier)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to create checkout session. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              SmartPromts
            </span>
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        {!isStripeConfigured && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Stripe billing is not fully configured. Subscription features may not be available.
            </p>
          </div>
        )}
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that&apos;s right for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 relative ${
                tier.popular
                  ? 'ring-2 ring-blue-600 dark:ring-blue-500'
                  : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  {tier.id !== 'free' && (
                    <span className="text-gray-600 dark:text-gray-300 ml-2">
                      /month
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier.priceId, tier.id)}
                disabled={loading === tier.id}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  tier.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === tier.id
                  ? 'Loading...'
                  : tier.id === 'free'
                  ? 'Get Started'
                  : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
