import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import {
  Activity,
  Code2,
  Cpu,
  FileCode2,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Server,
  Settings,
  Terminal,
  Zap,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DeveloperPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirect=/developer')
  }

  const user = await getCurrentUser()
  if (!user || (user.subscription_tier !== 'admin' && user.subscription_tier !== 'developer')) {
    redirect('/dashboard')
  }

  const apiEndpoints = [
    { method: 'POST', path: '/api/optimize', description: 'Optimize a prompt for an AI model', auth: true },
    { method: 'GET', path: '/api/health', description: 'Health check — service status', auth: false },
    { method: 'GET', path: '/api/metrics', description: 'Runtime metrics (admin/dev only)', auth: true },
    { method: 'POST', path: '/api/stripe/checkout', description: 'Create a Stripe checkout session', auth: true },
    { method: 'POST', path: '/api/stripe/webhook', description: 'Stripe webhook handler', auth: false },
    { method: 'POST', path: '/api/verify-nft', description: 'Verify NFT Lifetime Pass ownership', auth: true },
    { method: 'POST', path: '/api/auth/signout', description: 'Sign out current session', auth: true },
    { method: 'POST', path: '/api/admin/ban', description: 'Ban a user (admin only)', auth: true },
    { method: 'POST', path: '/api/admin/unban', description: 'Unban a user (admin only)', auth: true },
    { method: 'POST', path: '/api/admin/update-tier', description: 'Change user subscription tier', auth: true },
    { method: 'POST', path: '/api/admin/reset-usage', description: 'Reset user usage counter', auth: true },
  ]

  const envVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', set: !!process.env.NEXT_PUBLIC_SUPABASE_URL, required: true },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, required: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', set: !!process.env.SUPABASE_SERVICE_ROLE_KEY, required: true },
    { name: 'OPENAI_API_KEY', set: !!process.env.OPENAI_API_KEY, required: true },
    { name: 'STRIPE_SECRET_KEY', set: !!process.env.STRIPE_SECRET_KEY, required: false },
    { name: 'STRIPE_WEBHOOK_SECRET', set: !!process.env.STRIPE_WEBHOOK_SECRET, required: false },
    { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', set: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, required: false },
    { name: 'UPSTASH_REDIS_REST_URL', set: !!process.env.UPSTASH_REDIS_REST_URL, required: false },
    { name: 'UPSTASH_REDIS_REST_TOKEN', set: !!process.env.UPSTASH_REDIS_REST_TOKEN, required: false },
    { name: 'NFT_DEPLOYER_PRIVATE_KEY', set: !!process.env.NFT_DEPLOYER_PRIVATE_KEY, required: false },
    { name: 'BASESCAN_API_KEY', set: !!process.env.BASESCAN_API_KEY, required: false },
  ]

  const configuredCount = envVars.filter((e) => e.set).length
  const requiredCount = envVars.filter((e) => e.required).length
  const requiredConfigured = envVars.filter((e) => e.required && e.set).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Nav */}
      <header className="border-b border-blue-900/30 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Zap className="h-7 w-7 text-cyan-400" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/30 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                SmartPromts
              </span>
            </Link>
            <nav className="flex items-center space-x-1">
              {[
                { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/developer', label: 'Developer', icon: Code2 },
                { href: '/admin', label: 'Admin', icon: Settings },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Terminal className="h-8 w-8 text-cyan-400" />
            Developer Dashboard
          </h1>
          <p className="text-gray-400">API monitoring, environment configuration, and diagnostics</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'API Endpoints',
              value: apiEndpoints.length,
              icon: Server,
              cardClass: 'bg-slate-800/50 border border-cyan-500/20 rounded-xl p-5',
              iconClass: 'h-4 w-4 text-cyan-400',
              valueClass: 'text-2xl font-bold text-cyan-300',
            },
            {
              label: 'Env Vars Set',
              value: `${configuredCount}/${envVars.length}`,
              icon: FileCode2,
              cardClass: 'bg-slate-800/50 border border-blue-500/20 rounded-xl p-5',
              iconClass: 'h-4 w-4 text-blue-400',
              valueClass: 'text-2xl font-bold text-blue-300',
            },
            {
              label: 'Required Configured',
              value: `${requiredConfigured}/${requiredCount}`,
              icon: Activity,
              cardClass: `bg-slate-800/50 border ${requiredConfigured === requiredCount ? 'border-green-500/20' : 'border-red-500/20'} rounded-xl p-5`,
              iconClass: `h-4 w-4 ${requiredConfigured === requiredCount ? 'text-green-400' : 'text-red-400'}`,
              valueClass: `text-2xl font-bold ${requiredConfigured === requiredCount ? 'text-green-300' : 'text-red-300'}`,
            },
            {
              label: 'Runtime',
              value: 'Next.js 15',
              icon: Cpu,
              cardClass: 'bg-slate-800/50 border border-purple-500/20 rounded-xl p-5',
              iconClass: 'h-4 w-4 text-purple-400',
              valueClass: 'text-2xl font-bold text-purple-300',
            },
          ].map(({ label, value, icon: Icon, cardClass, iconClass, valueClass }) => (
            <div key={label} className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
                <Icon className={iconClass} />
              </div>
              <p className={valueClass}>{value}</p>
            </div>
          ))}
        </div>

        {/* API Reference */}
        <div className="bg-slate-800/50 border border-blue-900/30 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-900/30 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">API Reference</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Endpoint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {apiEndpoints.map((ep) => (
                  <tr key={ep.path} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                          ep.method === 'GET'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm text-cyan-300 font-mono">{ep.path}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{ep.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ep.auth
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {ep.auth ? 'Required' : 'Public'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environment Configuration */}
        <div className="bg-slate-800/50 border border-blue-900/30 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-900/30 flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Environment Configuration</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-3">
            {envVars.map((env) => (
              <div
                key={env.name}
                className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-3"
              >
                <div>
                  <code className="text-sm text-gray-200 font-mono">{env.name}</code>
                  {env.required && (
                    <span className="ml-2 text-xs text-red-400 font-medium">required</span>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    env.set
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${env.set ? 'bg-green-400' : 'bg-red-400'}`} />
                  {env.set ? 'Set' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-800/50 border border-blue-900/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cyan-400" />
            Quick Links
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Health Check', href: '/api/health', desc: 'Service status JSON' },
              { label: 'Metrics', href: '/api/metrics', desc: 'Runtime metrics JSON' },
              { label: 'API Docs', href: 'https://github.com/SMSDAO/SmartPromts/tree/main/docs', desc: 'Full API documentation' },
            ].map(({ label, href, desc }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-cyan-500/30 rounded-lg p-4 transition-all group"
              >
                <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">{label}</p>
                <p className="text-xs text-gray-400 mt-1">{desc}</p>
                <code className="text-xs text-cyan-400/70 mt-2 block">{href}</code>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
