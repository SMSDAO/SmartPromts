'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ModelUsage {
  model: string
  count: number
  total_tokens: number
}

interface TopPrompt {
  prompt_id: string
  count: number
}

export default function AnalyticsPage() {
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([])
  const [topPrompts, setTopPrompts] = useState<TopPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulated summary stats (in a real app these would come from API)
  const stats = [
    { label: 'Total Runs', value: '1,247', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { label: 'Tokens Used', value: '2.4M', icon: BarChart3, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
    { label: 'Total Cost', value: '$4.82', icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
    { label: 'Success Rate', value: '94.2%', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20' },
  ]

  useEffect(() => {
    // In a real app, fetch from /api/analytics
    setLoading(false)
    setModelUsage([
      { model: 'gpt-4', count: 423, total_tokens: 892000 },
      { model: 'gpt-3.5-turbo', count: 698, total_tokens: 1230000 },
      { model: 'claude-3-opus', count: 126, total_tokens: 278000 },
    ])
    setTopPrompts([
      { prompt_id: 'Code Review Assistant', count: 89 },
      { prompt_id: 'Content Summarizer', count: 67 },
      { prompt_id: 'SQL Query Generator', count: 54 },
      { prompt_id: 'Email Writer', count: 43 },
      { prompt_id: 'Bug Detector', count: 38 },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-gray-400">Monitor usage, costs, and performance across your prompt library.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className={`${s.bg} border border-gray-800 rounded-xl p-5`}>
              <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Model Usage */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Model Usage
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-800 rounded animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {modelUsage.map(m => {
                  const maxCount = Math.max(...modelUsage.map(x => x.count))
                  const pct = (m.count / maxCount) * 100
                  return (
                    <div key={m.model}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{m.model}</span>
                        <span className="text-gray-400">{m.count} runs</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{(m.total_tokens / 1000).toFixed(0)}K tokens</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top Prompts Leaderboard */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Top Prompts
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-gray-800 rounded animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {topPrompts.map((p, i) => (
                  <div key={p.prompt_id} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{p.prompt_id}</p>
                    </div>
                    <span className="text-sm text-cyan-400 font-medium">{p.count} uses</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cost & Latency breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Avg Latency', value: '1.2s', sub: 'across all models', color: 'text-cyan-400' },
              { label: 'p90 Latency', value: '2.8s', sub: '90th percentile', color: 'text-purple-400' },
              { label: 'Cost per Run', value: '$0.0039', sub: 'average cost', color: 'text-yellow-400' },
            ].map(item => (
              <div key={item.label} className="bg-gray-800 rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-sm text-white mt-1">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
