import Link from 'next/link'
import { ArrowRight, Zap, Shield, TrendingUp, Sparkles, Users, Award } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-blue-900/20">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-cyan-400" />
              <div className="absolute inset-0 blur-xl bg-cyan-400/30 animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SmartPromts
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="relative px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-900/30 border border-cyan-500/30 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-sm text-cyan-300">AI-Powered Prompt Optimization</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Supercharge Your AI</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              With Smart Prompts
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform prompts for GPT-4, Claude, Gemini, and more. 
            Trusted by builders on <span className="text-cyan-400 font-semibold">@TradeOS</span>, <span className="text-cyan-400 font-semibold">@SolanaRemix</span>, 
            and <span className="text-cyan-400 font-semibold">@gxqstudio.eth</span>
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/login"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all text-lg font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
              Start Optimizing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 bg-slate-800/50 text-white rounded-lg hover:bg-slate-800 transition-all text-lg font-semibold border border-slate-700 hover:border-cyan-500/50"
            >
              View Pricing
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-cyan-400" />
              <span>10K+ Users</span>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-cyan-400" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/50">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Instant Optimization
              </h3>
              <p className="text-gray-400">
                Transform your prompts in seconds with AI-powered optimization that
                improves clarity and effectiveness.
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Enterprise Ready
              </h3>
              <p className="text-gray-400">
                Built with security and scalability in mind. Rate limiting, usage
                tracking, and tier-based access control.
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-xl border border-slate-700 hover:border-green-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-green-500/50">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Better Results
              </h3>
              <p className="text-gray-400">
                Get more accurate, relevant, and efficient responses from your AI
                models with optimized prompts.
              </p>
            </div>
          </div>
        </div>

        {/* NFT Lifetime Pass CTA */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 p-12 rounded-2xl border border-cyan-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
            <div className="relative text-center">
              <Award className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                NFT Lifetime Pass on Base
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Mint your Lifetime Pass NFT for unlimited prompt optimizations forever. 
                Early bird pricing starts at just 0.05 ETH. Limited to 1,000 passes.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-400 hover:to-cyan-400 transition-all text-lg font-semibold shadow-lg shadow-purple-500/50"
              >
                View Lifetime Pass
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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
