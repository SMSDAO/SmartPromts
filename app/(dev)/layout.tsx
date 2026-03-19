import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Code2, Database, Cpu, GitBranch, FlaskConical, Zap, LogOut } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { hasRole } from '@/lib/rbac'
import { AnimatedBackground } from '@/components/ui/neoglow'

export default async function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/developer')
  }

  if (!hasRole(user, ['admin', 'developer'])) {
    redirect('/dashboard')
  }

  const navItems = [
    { href: '/developer', label: 'Dev Console', icon: Code2 },
    { href: '/benchmarks', label: 'Benchmarks', icon: Cpu },
    { href: '/experiments', label: 'Experiments', icon: FlaskConical },
    { href: '/tuning', label: 'Tuning', icon: GitBranch },
    { href: '/agents', label: 'Agents', icon: Database },
  ]

  return (
    <div className="relative min-h-screen bg-gray-950 text-white">
      <AnimatedBackground theme="cyan" />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-60 border-r border-cyan-500/20 bg-black/40 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-cyan-500/20 px-6 py-5">
            <div className="relative">
              <Zap className="h-7 w-7 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse blur-md bg-cyan-400/30" />
            </div>
            <div>
              <span className="block text-base font-bold text-white">SmartPromts</span>
              <span className="flex items-center gap-1 text-xs text-cyan-400">
                <Code2 className="h-3 w-3" />
                Developer
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-cyan-500/10 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              >
                <Icon className="h-4 w-4 transition-colors group-hover:text-cyan-400" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-cyan-500/20 px-4 py-4 space-y-3">
            <div className="rounded-xl bg-cyan-500/10 px-3 py-3">
              <p className="text-xs font-semibold text-cyan-300">
                {user.subscription_tier === 'admin' ? 'Admin' : 'Developer'}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-400">{user.email}</p>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-60">{children}</div>
    </div>
  )
}
