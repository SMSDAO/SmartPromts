'use client'

import { useState } from 'react'

interface AdminActionsProps {
  userId: string
  currentTier: string
  isBanned: boolean
  onActionComplete: () => void
}

export default function AdminActions({
  userId,
  currentTier,
  isBanned,
  onActionComplete,
}: AdminActionsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setError(message)
      setSuccess(null)
    } else {
      setSuccess(message)
      setError(null)
    }
    setTimeout(() => {
      setError(null)
      setSuccess(null)
    }, 3000)
  }

  const handleUpdateTier = async (newTier: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/update-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          tier: newTier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tier')
      }

      showMessage(`Tier updated to ${newTier}`)
      onActionComplete()
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to update tier', true)
    } finally {
      setLoading(false)
    }
  }

  const handleResetUsage = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/reset-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset usage')
      }

      showMessage('Usage reset successfully')
      onActionComplete()
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to reset usage', true)
    } finally {
      setLoading(false)
    }
  }

  const handleBan = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to ban user')
      }

      showMessage('User banned successfully')
      onActionComplete()
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to ban user', true)
    } finally {
      setLoading(false)
    }
  }

  const handleUnban = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unban user')
      }

      showMessage('User unbanned successfully')
      onActionComplete()
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to unban user', true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      {/* Update Tier */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Update Tier</label>
        <div className="flex flex-wrap gap-2">
          {['free', 'pro', 'enterprise', 'lifetime', 'admin'].map((tier) => (
            <button
              key={tier}
              onClick={() => handleUpdateTier(tier)}
              disabled={loading || currentTier === tier}
              aria-label={`Update tier to ${tier}`}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                currentTier === tier
                  ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleResetUsage}
          disabled={loading}
          aria-label="Reset user usage count to zero"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reset Usage
        </button>

        {isBanned ? (
          <button
            onClick={handleUnban}
            disabled={loading}
            aria-label="Unban this user account"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Unban User
          </button>
        ) : (
          <button
            onClick={handleBan}
            disabled={loading}
            aria-label="Ban this user account"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ban User
          </button>
        )}
      </div>
    </div>
  )
}
