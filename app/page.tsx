import Link from 'next/link'
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              SmartPromts
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI Smart Prompts
            <br />
            <span className="text-blue-600">Optimized for Any Model</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Enhance your AI prompts with advanced optimization, intelligent caching,
            and dynamic balancing. Get better results from any AI model.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Start Optimizing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg font-semibold border border-gray-200 dark:border-gray-700"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Instant Optimization
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Transform your prompts in seconds with AI-powered optimization that
              improves clarity and effectiveness.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Enterprise Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built with security and scalability in mind. Rate limiting, usage
              tracking, and tier-based access control.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Better Results
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get more accurate, relevant, and efficient responses from your AI
              models with optimized prompts.
            </p>
          </div>
        </div>

        {/* Screenshot Placeholder */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 shadow-2xl">
            <div className="aspect-video bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 dark:text-gray-500 text-lg">
                Dashboard Screenshot Placeholder
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 SmartPromts. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
