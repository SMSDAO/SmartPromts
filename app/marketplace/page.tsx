'use client'

import { useState, useEffect, useCallback } from 'react'
import { Store, Search, Star, Download, AlertCircle, Tag } from 'lucide-react'
import Link from 'next/link'

interface MarketplacePrompt {
  id: string
  title: string
  description: string
  category: string
  price: number
  creator_id: string
  downloads: number
  rating: number
  tags: string[]
  license: string
  created_at: string
}

const CATEGORIES = ['All', 'general', 'coding', 'writing', 'analysis', 'creative', 'business', 'education']

export default function MarketplacePage() {
  const [prompts, setPrompts] = useState<MarketplacePrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const loadPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category !== 'All') params.set('category', category)
      const res = await fetch(`/api/marketplace?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load')
      setPrompts(data.prompts ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marketplace')
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => { loadPrompts() }, [loadPrompts])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Prompt Marketplace
            </h1>
          </div>
          <p className="text-gray-400">Discover and purchase high-quality prompts from the community.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-48 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Categories</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat
                      ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {error && (
              <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded mb-3 w-3/4" />
                    <div className="h-3 bg-gray-800 rounded mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No prompts found</p>
                <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or be the first to publish a prompt.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prompts.map(p => (
                  <Link key={p.id} href={`/marketplace/${p.id}`} className="block group">
                    <div className="bg-gray-900 border border-gray-800 group-hover:border-cyan-500/50 rounded-xl p-5 transition-all h-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                        <span className="text-sm font-bold text-cyan-400 ml-2 flex-shrink-0">
                          {p.price === 0 ? 'Free' : `$${p.price}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {p.rating.toFixed(1)}</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {p.downloads}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {p.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
