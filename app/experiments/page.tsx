'use client'

import { useState, useCallback } from 'react'
import { FlaskConical, Play, AlertCircle, Trophy, BarChart3 } from 'lucide-react'

interface ExperimentMetrics {
  avg_score: number
  win_rate: number
  avg_latency: number
  total_runs: number
}

interface ABTestResult {
  experiment_id: string
  prompt_a_id: string
  prompt_b_id: string
  winner: string
  confidence: number
  metrics_a: ExperimentMetrics
  metrics_b: ExperimentMetrics
}

export default function ExperimentsPage() {
  const [promptA, setPromptA] = useState('')
  const [promptB, setPromptB] = useState('')
  const [testInputs, setTestInputs] = useState('What is AI?\nExplain machine learning.\nWhat are neural networks?')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ABTestResult | null>(null)

  const runExperiment = useCallback(async () => {
    if (!promptA.trim() || !promptB.trim()) return
    setLoading(true)
    setError(null)
    try {
      const inputs = testInputs.split('\n').filter(s => s.trim())
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: `exp_a_${Date.now()}`,
          prompt: promptA,
          dataset_examples: inputs.map(i => ({ input: i })),
          expected_outputs: inputs.map(() => ''),
        }),
      })
      const dataA = await res.json()

      const resB = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: `exp_b_${Date.now()}`,
          prompt: promptB,
          dataset_examples: inputs.map(i => ({ input: i })),
          expected_outputs: inputs.map(() => ''),
        }),
      })
      const dataB = await resB.json()

      if (!res.ok) throw new Error(dataA.error ?? 'Experiment failed')
      if (!resB.ok) throw new Error(dataB.error ?? 'Experiment failed')

      const rA = dataA.result
      const rB = dataB.result
      const winnerIsA = rA.score >= rB.score
      setResult({
        experiment_id: `exp_${Date.now()}`,
        prompt_a_id: `exp_a`,
        prompt_b_id: `exp_b`,
        winner: winnerIsA ? 'Prompt A' : 'Prompt B',
        confidence: Math.abs(rA.score - rB.score) * 2,
        metrics_a: { avg_score: rA.score, win_rate: rA.success_rate, avg_latency: rA.latency_avg, total_runs: rA.results.length },
        metrics_b: { avg_score: rB.score, win_rate: rB.success_rate, avg_latency: rB.latency_avg, total_runs: rB.results.length },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [promptA, promptB, testInputs])

  const MetricsCard = ({ label, metrics, isWinner }: { label: string; metrics: ExperimentMetrics; isWinner: boolean }) => (
    <div className={`bg-gray-900 border rounded-xl p-5 ${isWinner ? 'border-cyan-500/50' : 'border-gray-800'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        {isWinner && <span className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded"><Trophy className="w-3 h-3" /> Winner</span>}
      </div>
      <div className="space-y-3">
        {[
          { k: 'Accuracy', v: `${(metrics.avg_score * 100).toFixed(1)}%` },
          { k: 'Win Rate', v: `${(metrics.win_rate * 100).toFixed(1)}%` },
          { k: 'Avg Latency', v: `${metrics.avg_latency.toFixed(0)}ms` },
          { k: 'Total Runs', v: metrics.total_runs.toString() },
        ].map(({ k, v }) => (
          <div key={k} className="flex justify-between">
            <span className="text-sm text-gray-400">{k}</span>
            <span className="text-sm font-medium text-white">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              A/B Experiments
            </h1>
          </div>
          <p className="text-gray-400">Compare two prompts head-to-head to find the better performer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Prompt A', value: promptA, onChange: setPromptA, placeholder: 'Enter Prompt A...' },
            { label: 'Prompt B', value: promptB, onChange: setPromptB, placeholder: 'Enter Prompt B...' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
              <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Test Inputs (one per line)
          </label>
          <textarea
            value={testInputs}
            onChange={e => setTestInputs(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none mb-4"
          />
          <button
            onClick={runExperiment}
            disabled={loading || !promptA.trim() || !promptB.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Running Experiment...' : 'Run A/B Test'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-400 mb-1">Winner</p>
              <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-400" />
                {result.winner}
              </p>
              <p className="text-sm text-gray-400 mt-2">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricsCard label="Prompt A" metrics={result.metrics_a} isWinner={result.winner === 'Prompt A'} />
              <MetricsCard label="Prompt B" metrics={result.metrics_b} isWinner={result.winner === 'Prompt B'} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
