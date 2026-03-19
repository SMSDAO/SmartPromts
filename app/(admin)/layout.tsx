import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, Users, BarChart3, CreditCard, Bot, ScrollText, Zap } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { hasRole } from '@/lib/rbac'
import { AnimatedBackground } from '@/components/ui/neoglow'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  if (!hasRole(user, ['admin'])) {
    redirect('/dashboard')
  }

  const navItems = [
    { href: '/admin', label: 'Users', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/agents', label: 'Agents', icon: Bot },
    { href: '/dashboard', label: 'Overview', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: CreditCard },
  ]

  return (
    <div className="relative min-h-screen bg-gray-950 text-white">
      <AnimatedBackground theme="purple" />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-60 border-r border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-purple-500/20 px-6 py-5">
            <div className="relative">
              <Zap className="h-7 w-7 text-purple-400" />
              <div className="absolute inset-0 animate-pulse blur-md bg-purple-400/30" />
            </div>
            <div>
              <span className="block text-base font-bold text-white">SmartPromts</span>
              <span className="flex items-center gap-1 text-xs text-purple-400">
                <Shield className="h-3 w-3" />
                Admin Panel
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-purple-500/10 hover:text-purple-300 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              >
                <Icon className="h-4 w-4 transition-colors group-hover:text-purple-400" />
                {label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/5">
              <Link
                href="/developer"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-all hover:bg-cyan-500/10 hover:text-cyan-300"
              >
                <ScrollText className="h-4 w-4" />
                Dev Console
              </Link>
            </div>
          </nav>

          <div className="border-t border-purple-500/20 px-4 py-4">
            <div className="rounded-xl bg-purple-500/10 px-3 py-3">
              <p className="text-xs font-semibold text-purple-300">Signed in as admin</p>
              <p className="mt-0.5 truncate text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-60">{children}</div>
    </div>
  )
}
