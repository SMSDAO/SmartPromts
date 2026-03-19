'use client'

import { useState, useCallback } from 'react'
import { Settings, Play, TrendingUp, AlertCircle, Star } from 'lucide-react'

interface PromptVariant {
  id: string
  prompt: string
  score: number
  technique: string
}

interface TuningResult {
  best_prompt: string
  best_score: number
  performance_gain: number
  iterations: number
  variants: PromptVariant[]
}

export default function TuningPage() {
  const [prompt, setPrompt] = useState('')
  const [iterations, setIterations] = useState(3)
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TuningResult | null>(null)

  const startTuning = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tuning/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id: `tune_${Date.now()}`, prompt, iterations, model }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Tuning failed')
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [prompt, iterations, model])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Auto-Tuning
            </h1>
          </div>
          <p className="text-gray-400">Automatically mutate and evolve your prompts to find the optimal version.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tuning Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Original Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter the prompt you want to tune..."
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Iterations: {iterations}</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={iterations}
                  onChange={e => setIterations(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={startTuning}
                  disabled={loading || !prompt.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Tuning...' : 'Start Tuning'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Tuning Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Best Score', value: `${(result.best_score * 100).toFixed(1)}%` },
                { label: 'Performance Gain', value: `+${result.performance_gain.toFixed(1)}%` },
                { label: 'Iterations', value: result.iterations.toString() },
              ].map(c => (
                <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{c.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Best Prompt</h3>
              </div>
              <pre className="bg-gray-800 rounded-lg p-4 text-cyan-300 text-sm whitespace-pre-wrap font-mono">
                {result.best_prompt}
              </pre>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  All Variants ({result.variants.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-800">
                {result.variants.map((v, i) => (
                  <div key={v.id} className="p-4 hover:bg-gray-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                        {v.technique}
                      </span>
                      <span className={`text-sm font-bold ${i === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {(v.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{v.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
