'use client'

import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

interface NFTVerificationProps {
  /** Called after a successful tier upgrade */
  onUpgrade?: () => void
}

/**
 * Silently verifies whether the connected wallet holds a SmartPromts Lifetime
 * Pass NFT and auto-upgrades the user's subscription tier if it does.
 *
 * Renders a toast notification on success or error. Mount this inside the
 * authenticated dashboard layout.
 */
export function NFTVerification({ onUpgrade }: NFTVerificationProps) {
  const { address, isConnected } = useAccount()
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const verifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address) return
    // Only verify once per wallet address
    if (verifiedRef.current === address) return
    verifiedRef.current = address

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch('/api/verify-nft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        })

        if (cancelled) return

        const data = await res.json()

        if (!res.ok) {
          console.error('NFT verification failed:', data.error)
          return
        }

        if (data.upgraded) {
          setToast({
            type: 'success',
            message: '🎉 Lifetime Pass detected! Your account has been upgraded to Lifetime tier.',
          })
          onUpgrade?.()
        } else if (data.hasPass) {
          setToast({
            type: 'info',
            message: '✅ Lifetime Pass verified. You already have the lifetime tier.',
          })
        }
      } catch (err) {
        console.error('NFT verification request error:', err)
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [address, isConnected, onUpgrade])

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  const colors = {
    success: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300',
    error: 'border-red-500/40 bg-red-950/60 text-red-300',
    info: 'border-blue-500/40 bg-blue-950/60 text-blue-300',
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 ${colors[toast.type]}`}
    >
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => setToast(null)}
        className="mt-0.5 shrink-0 opacity-60 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}
