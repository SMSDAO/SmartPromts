'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Sparkles, Loader2, AlertCircle, ArrowRight, Crown } from 'lucide-react'
import Link from 'next/link'

interface OptimizeResult {
  original: string
  optimized: string
  improvements: string[]
  tokensEstimate: number
}

interface UsageInfo {
  remaining: number
  limit: number
  resetAt: string
  tier?: string
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [context, setContext] = useState('')
  const [result, setResult] = useState<OptimizeResult | null>(null)
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)

  const optimizeMutation = useMutation({
    mutationFn: async (data: { prompt: string; model?: string; context?: string }) => {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to optimize prompt')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setResult(data.data)
      setUsageInfo({ ...data.usage, tier: data.usage.tier || 'free' })
    },
  })

  const handleOptimize = () => {
    if (!prompt.trim()) return

    optimizeMutation.mutate({
      prompt,
      model,
      context: context || undefined,
    })
  }

  // Show upgrade CTA for free tier users
  const showUpgradeCTA = usageInfo?.tier === 'free' || usageInfo?.limit === 10

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Prompt Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Enhance your AI prompts for better results
        </p>
      </div>

      {/* Upgrade CTA Banner for Free Tier */}
      {showUpgradeCTA && (
        <div className="mb-6 relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-blue-600/50 blur-3xl opacity-50" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <Crown className="h-8 w-8 text-yellow-300 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Upgrade to Pro or Lifetime
                </h3>
                <p className="text-blue-100 text-sm">
                  Get 1,000+ optimizations/month or unlimited with Lifetime Pass NFT
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg"
            >
              View Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {usageInfo && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Usage:</strong> {usageInfo.remaining} of {usageInfo.limit === -1 ? <span aria-label="unlimited">∞</span> : usageInfo.limit} remaining
            {usageInfo.limit !== -1 && ` (Resets: ${new Date(usageInfo.resetAt).toLocaleDateString()})`}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Input Prompt
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Add any additional context..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <button
                onClick={handleOptimize}
                disabled={!prompt.trim() || optimizeMutation.isPending}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {optimizeMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Optimize Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Optimized Result
            </h2>

            {optimizeMutation.isError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {optimizeMutation.error?.message}
                  </p>
                </div>
              </div>
            )}

            {result ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Optimized Prompt
                  </label>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {result.optimized}
                    </p>
                  </div>
                </div>

                {result.improvements.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Improvements
                    </label>
                    <ul className="space-y-2">
                      {result.improvements.map((improvement, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-green-600 dark:text-green-400">✓</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Estimated Tokens:</strong> ~{result.tokensEstimate}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your optimized prompt will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
