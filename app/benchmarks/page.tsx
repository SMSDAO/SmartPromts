'use client'

import { useState, useCallback } from 'react'
import { Zap, Play, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'

interface SingleResult {
  input: string
  expected: string
  actual: string
  score: number
  latency_ms: number
  tokens: number
}

interface BenchmarkResult {
  dataset_id: string
  prompt_id: string
  score: number
  latency_avg: number
  token_cost: number
  success_rate: number
  results: SingleResult[]
}

export default function BenchmarksPage() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BenchmarkResult | null>(null)

  const runBenchmark = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: `bench_${Date.now()}`,
          prompt,
          model,
          dataset_examples: [
            { input: 'What is artificial intelligence?' },
            { input: 'Explain machine learning in simple terms.' },
            { input: 'What are neural networks?' },
          ],
          expected_outputs: [
            'AI is the simulation of human intelligence by machines.',
            'Machine learning is teaching computers to learn from data.',
            'Neural networks are computing systems inspired by the brain.',
          ],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Benchmark failed')
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [prompt, model])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Benchmark Runner
            </h1>
          </div>
          <p className="text-gray-400">Test your prompts against datasets to measure accuracy, latency, and cost.</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Configure Benchmark</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">System Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter your prompt to benchmark..."
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>
              <div className="flex-1 flex items-end">
                <button
                  onClick={runBenchmark}
                  disabled={loading || !prompt.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Running...' : 'Run Benchmark'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Results</h2>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Accuracy Score', value: `${(result.score * 100).toFixed(1)}%`, icon: CheckCircle, color: 'text-green-400' },
                { label: 'Avg Latency', value: `${result.latency_avg.toFixed(0)}ms`, icon: Clock, color: 'text-cyan-400' },
                { label: 'Token Cost', value: `$${result.token_cost.toFixed(4)}`, icon: DollarSign, color: 'text-yellow-400' },
                { label: 'Success Rate', value: `${(result.success_rate * 100).toFixed(1)}%`, icon: Zap, color: 'text-purple-400' },
              ].map(card => (
                <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Results table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Individual Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left px-4 py-3">Input</th>
                      <th className="text-left px-4 py-3">Actual Output</th>
                      <th className="text-right px-4 py-3">Score</th>
                      <th className="text-right px-4 py-3">Latency</th>
                      <th className="text-right px-4 py-3">Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((r, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{r.input}</td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{r.actual || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={r.score > 0.5 ? 'text-green-400' : 'text-red-400'}>
                            {(r.score * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-cyan-400">{r.latency_ms}ms</td>
                        <td className="px-4 py-3 text-right text-gray-400">{r.tokens}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
