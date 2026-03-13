'use client'

import { useEffect, useRef, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

interface NFTVerificationProps {
  /** Called after a successful tier upgrade */
  onUpgrade?: () => void
}

/** Build the deterministic ownership-proof message signed by the wallet. */
function ownershipMessage(walletAddress: string): string {
  return `Verify SmartPromts Lifetime Pass ownership.\nAddress: ${walletAddress.toLowerCase()}`
}

/**
 * Silently checks whether the connected wallet holds a SmartPromts Lifetime
 * Pass NFT (read-only, no signature required) and shows a prompt to activate
 * the Lifetime tier if a pass is found.
 *
 * Upgrading the tier requires the user to explicitly click "Activate" and sign
 * a message, proving ownership of the wallet. This prevents any authenticated
 * user from claiming someone else's wallet address.
 *
 * Mount this inside the authenticated dashboard layout.
 */
export function NFTVerification({ onUpgrade }: NFTVerificationProps) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    activatable?: boolean
  } | null>(null)
  const [activating, setActivating] = useState(false)

  // Tracks the last address for which we completed a successful check
  const checkedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address) return
    // Only run the read-only check once per address per session
    if (checkedRef.current === address) return

    let cancelled = false

    async function checkPassOwnership() {
      try {
        const res = await fetch('/api/verify-nft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send a read-only check (no signature) — server skips upgrade
          body: JSON.stringify({ walletAddress: address, checkOnly: true }),
        })

        if (cancelled) return

        const data = await res.json()

        if (!res.ok) {
          console.error('NFT pass check failed:', data.error)
          // Do not mark as checked — allow retry on next render cycle
          return
        }

        // Mark as checked only on a successful response
        checkedRef.current = address as string

        if (data.upgraded) {
          // Already upgraded (e.g., from a previous session)
          setToast({
            type: 'info',
            message: '✅ Lifetime Pass verified. You already have the lifetime tier.',
          })
          onUpgrade?.()
        } else if (data.hasPass) {
          // Has a pass but tier not yet upgraded — prompt explicit activation
          setToast({
            type: 'success',
            message: '🎉 Lifetime Pass detected! Activate your Lifetime tier.',
            activatable: true,
          })
        }
      } catch (err) {
        console.error('NFT pass check error:', err)
        // Do not set checkedRef — allow retry
      }
    }

    checkPassOwnership()
    return () => {
      cancelled = true
    }
  }, [address, isConnected, onUpgrade])

  /** Called when the user explicitly clicks "Activate Lifetime Tier". */
  async function handleActivate() {
    if (!address || activating) return
    setActivating(true)
    try {
      const message = ownershipMessage(address)
      const signature = await signMessageAsync({ message })

      const res = await fetch('/api/verify-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature }),
      })
      const data = await res.json()

      if (!res.ok) {
        setToast({
          type: 'error',
          message: data.error ?? 'Activation failed. Please try again.',
        })
        return
      }

      if (data.upgraded) {
        setToast({
          type: 'success',
          message: '🎉 Account upgraded to Lifetime tier!',
        })
        onUpgrade?.()
      } else {
        setToast({
          type: 'info',
          message: '✅ Lifetime Pass verified. Tier is already active.',
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.split('\n')[0] : 'Unknown error'
      setToast({ type: 'error', message: `Activation failed: ${msg}` })
    } finally {
      setActivating(false)
    }
  }

  // Auto-dismiss non-activatable toasts after 6 seconds
  useEffect(() => {
    if (!toast || toast.activatable) return
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
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 ${colors[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1">{toast.message}</p>
        <button
          onClick={() => setToast(null)}
          className="mt-0.5 shrink-0 opacity-60 hover:opacity-100"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
      {toast.activatable && (
        <button
          onClick={handleActivate}
          disabled={activating}
          className="w-full rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-500/30 transition-all hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activating ? 'Sign in wallet…' : 'Activate Lifetime Tier'}
        </button>
      )}
    </div>
  )
}
