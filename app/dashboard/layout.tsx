import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, LogOut, LayoutDashboard, Settings, Code2, Shield } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // getCurrentUser handles the session check internally — no need for a second client
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = user.subscription_tier === 'admin'
  const isDeveloper = user.subscription_tier === 'developer' || isAdmin

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                SmartPromts
              </span>
            </Link>
            <nav className="flex items-center space-x-1">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              {isDeveloper && (
                <Link
                  href="/developer"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Developer</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                href="/pricing"
                className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all"
              >
                Pricing
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

