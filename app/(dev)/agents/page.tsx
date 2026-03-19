'use client'

import { useState, useCallback } from 'react'
import { Bot, Play, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

const AVAILABLE_TOOLS = ['webSearch', 'dbQuery', 'codeInterpreter', 'fileReader', 'apiConnector']

interface AgentStep {
  node_id: string
  output: string
}

interface AgentRunResult {
  agent_id: string
  input: string
  output: string
  steps: AgentStep[]
  tokens_used: number
  latency_ms: number
}

export default function AgentsPage() {
  const [agentName, setAgentName] = useState('My Agent')
  const [agentDescription, setAgentDescription] = useState('A general-purpose AI agent')
  const [selectedTools, setSelectedTools] = useState<string[]>(['webSearch', 'dbQuery'])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AgentRunResult | null>(null)
  const [showSteps, setShowSteps] = useState(false)

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])
  }

  const runAgent = useCallback(async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_config: { name: agentName, description: agentDescription, tools: selectedTools, prompts: [] },
          input,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Agent run failed')
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [agentName, agentDescription, selectedTools, input])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Agent Builder
            </h1>
          </div>
          <p className="text-gray-400">Build and run AI agents with custom tools and workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Agent Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name</label>
                <input
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <input
                  value={agentDescription}
                  onChange={e => setAgentDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Available Tools</h2>
            <div className="space-y-2">
              {AVAILABLE_TOOLS.map(tool => (
                <label key={tool} className="flex items-center gap-3 cursor-pointer hover:text-white text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool)}
                    onChange={() => toggleTool(tool)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <span className="text-sm">{tool}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Run Agent</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Input</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="What would you like the agent to do?"
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
            <button
              onClick={runAgent}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Running...' : 'Run Agent'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Agent Output</h3>
                <span className="ml-auto text-sm text-gray-400">{result.latency_ms}ms · {result.tokens_used} tokens</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-200 text-sm whitespace-pre-wrap">
                {result.output}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-300">Execution Steps ({result.steps.length})</span>
                {showSteps ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showSteps && (
                <div className="divide-y divide-gray-800">
                  {result.steps.map((step, i) => (
                    <div key={i} className="p-4">
                      <span className="text-xs font-medium text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded mb-2 inline-block">
                        {step.node_id}
                      </span>
                      <p className="text-sm text-gray-300 mt-2 line-clamp-3">{step.output}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
