'use client'

import { useState, useEffect } from 'react'
import { Store, Star, Download, Tag, ShoppingCart, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface MarketplacePrompt {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  price: number
  creator_id: string
  downloads: number
  rating: number
  tags: string[]
  license: string
  created_at: string
}

export default function MarketplaceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [prompt, setPrompt] = useState<MarketplacePrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    fetch(`/api/marketplace/${id}`)
      .then(r => r.json())
      .then(d => { setPrompt(d.prompt); setLoading(false) })
      .catch(() => { setError('Failed to load prompt'); setLoading(false) })
  }, [id])

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      const res = await fetch(`/api/marketplace/${id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_type: 'personal' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Purchase failed')
      setPurchased(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!prompt) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400">Prompt not found</p>
        <Link href="/marketplace" className="text-cyan-400 hover:underline mt-4 block">← Back to Marketplace</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/marketplace" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 capitalize">{prompt.category}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">{prompt.title}</h1>
              <p className="text-gray-400 mb-4">{prompt.description}</p>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>

            {purchased && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Prompt Content</h2>
                <pre className="bg-gray-800 rounded-lg p-4 text-cyan-300 text-sm whitespace-pre-wrap font-mono">
                  {prompt.prompt}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {prompt.price === 0 ? 'Free' : `$${prompt.price}`}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" />{prompt.rating.toFixed(1)}</span>
                <span className="flex items-center gap-1"><Download className="w-4 h-4" />{prompt.downloads}</span>
              </div>
              <div className="text-xs text-gray-500 mb-4">License: {prompt.license}</div>

              {error && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {purchased ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Purchased successfully!</span>
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {purchasing ? 'Processing...' : prompt.price === 0 ? 'Get for Free' : `Purchase for $${prompt.price}`}
                </button>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-500">
              <div className="flex items-center gap-1 mb-1"><Store className="w-3 h-3" /> Listed {new Date(prompt.created_at).toLocaleDateString()}</div>
              <div>Creator: {prompt.creator_id.slice(0, 8)}...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
