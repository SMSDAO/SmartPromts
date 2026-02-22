'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Zap, Award, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-blue-900/20">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-cyan-400" />
              <div className="absolute inset-0 blur-xl bg-cyan-400/30 animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SmartPromts
            </span>
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/50"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        {!isStripeConfigured && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-yellow-200 text-sm">
              ⚠️ Stripe billing is not fully configured. Subscription features may not be available.
            </p>
          </div>
        )}
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300">
            Choose the plan that&apos;s right for you
          </p>
        </div>

        {/* Subscription Tiers */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-8 border transition-all ${
                tier.popular
                  ? 'border-cyan-500/50 shadow-xl shadow-cyan-500/20'
                  : 'border-slate-700 hover:border-cyan-500/30'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-400 mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-white">
                    {tier.price}
                  </span>
                  {tier.id !== 'free' && (
                    <span className="text-gray-400 ml-2">
                      /month
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier.priceId, tier.id)}
                disabled={loading === tier.id}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-700/50 text-white hover:bg-slate-700 border border-slate-600'
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

        {/* NFT Lifetime Pass Section */}
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 rounded-2xl p-12 border border-cyan-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
            
            <div className="relative">
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full mb-6">
                  <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-sm text-purple-300">Limited Edition NFT</span>
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-4">
                  Lifetime Pass NFT on Base
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Mint your exclusive Lifetime Pass NFT for unlimited prompt optimizations forever. 
                  Tradeable on secondary markets. Only 1,000 ever minted.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-white mb-2">Early Bird</h4>
                  <p className="text-3xl font-bold text-purple-400 mb-2">0.05 ETH</p>
                  <p className="text-sm text-gray-400">First 100 passes (~$199)</p>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500/30 ring-2 ring-cyan-500/30">
                  <div className="text-xs text-cyan-400 font-semibold mb-2">BEST VALUE</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Regular</h4>
                  <p className="text-3xl font-bold text-cyan-400 mb-2">0.075 ETH</p>
                  <p className="text-sm text-gray-400">Next 500 passes (~$299)</p>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500/20">
                  <h4 className="text-lg font-semibold text-white mb-2">Final Tier</h4>
                  <p className="text-3xl font-bold text-blue-400 mb-2">0.1 ETH</p>
                  <p className="text-sm text-gray-400">Last 400 passes (~$399)</p>
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">What You Get</h3>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="flex items-start space-x-3 text-left">
                    <Award className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-medium">Unlimited Optimizations</p>
                      <p className="text-sm text-gray-400">Forever, no expiration</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-left">
                    <Award className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-medium">Exclusive Features</p>
                      <p className="text-sm text-gray-400">Priority support & early access</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-left">
                    <Award className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-medium">Transferable</p>
                      <p className="text-sm text-gray-400">Trade on OpenSea & other NFT marketplaces</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-left">
                    <Award className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-medium">Governance</p>
                      <p className="text-sm text-gray-400">Vote on new features & roadmap</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  disabled
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-400 hover:to-cyan-400 transition-all text-lg font-semibold shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Award className="mr-2 h-5 w-5" />
                  Mint Coming Soon
                </button>
                <p className="text-sm text-gray-400 mt-4">
                  Minting will open after contract deployment on Base mainnet
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-blue-900/20">
        <div className="text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} SmartPromts. Built on Base. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
