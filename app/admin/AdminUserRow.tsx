'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminActions from '@/components/AdminActions'

interface User {
  id: string
  email: string
  subscription_tier: string
  usage_count: number
  banned: boolean
  created_at: string
}

interface AdminUserRowProps {
  user: User
}

export default function AdminUserRow({ user }: AdminUserRowProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
      case 'lifetime':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'enterprise':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleActionComplete = () => {
    router.refresh()
    setIsExpanded(false)
  }

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
          {user.email}
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(
              user.subscription_tier
            )}`}
          >
            {user.subscription_tier}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
          {user.usage_count}
        </td>
        <td className="px-6 py-4">
          {user.banned ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              Banned
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
              Active
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
          {formatDate(user.created_at)}
        </td>
        <td className="px-6 py-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? 'Hide' : 'Manage'}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
            <AdminActions
              userId={user.id}
              currentTier={user.subscription_tier}
              isBanned={user.banned}
              onActionComplete={handleActionComplete}
            />
          </td>
        </tr>
      )}
    </>
  )
}
