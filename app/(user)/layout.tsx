import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Settings, ShoppingBag, Zap, BookMarked } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { AnimatedBackground } from '@/components/ui/neoglow'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/pricing', label: 'Upgrade', icon: BookMarked },
  ]

  return (
    <div className="relative min-h-screen bg-gray-950 text-white">
      <AnimatedBackground theme="default" />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-60 border-r border-blue-500/20 bg-black/40 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-blue-500/20 px-6 py-5">
            <div className="relative">
              <Zap className="h-7 w-7 text-blue-400" />
              <div className="absolute inset-0 animate-pulse blur-md bg-blue-400/30" />
            </div>
            <div>
              <span className="block text-base font-bold text-white">SmartPromts</span>
              <span className="text-xs capitalize text-blue-400">{user.subscription_tier}</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-all hover:bg-blue-500/10 hover:text-blue-300 hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
              >
                <Icon className="h-4 w-4 transition-colors group-hover:text-blue-400" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-blue-500/20 px-4 py-4">
            <div className="rounded-xl bg-blue-500/10 px-3 py-3">
              <p className="text-xs font-semibold capitalize text-blue-300">{user.subscription_tier} plan</p>
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
