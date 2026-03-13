'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSignMessage } from 'wagmi'
import { formatEther } from 'viem'
import { base } from 'wagmi/chains'
import {
  SMARTPROMTS_LIFETIME_PASS_ABI,
  CLIENT_NFT_CONTRACT_ADDRESS,
} from '@/lib/contracts/SmartPromtsLifetimePass'

// Pricing tiers matching the SmartPromtsLifetimePass contract constants
const PRICE_TIERS = [
  { label: 'Early Bird', range: '1–100', price: '0.05', threshold: 0, maxTokens: 100 },
  { label: 'Regular',    range: '101–600', price: '0.075', threshold: 100, maxTokens: 600 },
  { label: 'Final',      range: '601–1000', price: '0.1', threshold: 600, maxTokens: 1000 },
] as const

function getCurrentTierLabel(totalSupply: number): string {
  if (totalSupply < PRICE_TIERS[0].maxTokens) return PRICE_TIERS[0].label
  if (totalSupply < PRICE_TIERS[1].maxTokens) return PRICE_TIERS[1].label
  return PRICE_TIERS[2].label
}

/** Build the deterministic ownership-proof message signed by the wallet. */
function ownershipMessage(walletAddress: string): string {
  return `Verify SmartPromts Lifetime Pass ownership.\nAddress: ${walletAddress.toLowerCase()}`
}

interface NFTStats {
  totalSupply: number
  maxSupply: number
  mintingEnabled: boolean
  currentPrice: bigint
  hasMinted: boolean
}

interface MintNFTProps {
  stats: NFTStats
  onMintSuccess?: () => void
}

/**
 * Reusable mint component for the SmartPromts Lifetime Pass NFT.
 * Handles the full mint lifecycle: connect → mint → confirm → sign → verify.
 */
export function MintNFT({ stats, onMintSuccess }: MintNFTProps) {
  const { address, isConnected, chainId } = useAccount()
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  const { signMessageAsync } = useSignMessage()

  const isWrongNetwork = isConnected && chainId !== base.id

  async function handleMint() {
    if (!address || !CLIENT_NFT_CONTRACT_ADDRESS) return
    writeContract({
      address: CLIENT_NFT_CONTRACT_ADDRESS,
      abi: SMARTPROMTS_LIFETIME_PASS_ABI,
      functionName: 'mint',
      value: stats.currentPrice,
    })
  }

  /**
   * Verify wallet ownership via a signed message before upgrading the tier.
   * The signature proves the caller controls the submitted wallet address.
   */
  async function handleVerify() {
    if (!address || verifying) return
    setVerifying(true)
    setVerifyError(null)
    try {
      // 1. Ask the wallet to sign the ownership-proof message
      const message = ownershipMessage(address)
      const signature = await signMessageAsync({ message })

      // 2. Send address + signature to server for on-chain verification + upgrade
      const res = await fetch('/api/verify-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature }),
      })
      const data = await res.json()

      if (!res.ok) {
        setVerifyError(data.error ?? 'Verification failed. Please try again.')
        return
      }

      // Only mark verified after a confirmed success response
      setVerified(true)
      if (data.upgraded) {
        setUpgradeMessage('🎉 Account upgraded to Lifetime tier!')
        onMintSuccess?.()
      } else if (data.hasPass) {
        setUpgradeMessage('✅ Lifetime Pass verified.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.split('\n')[0] : 'Unknown error'
      setVerifyError(`Could not verify: ${msg}`)
    } finally {
      setVerifying(false)
    }
  }

  const priceInEth = formatEther(stats.currentPrice)
  const priceTier = getCurrentTierLabel(stats.totalSupply)
  const progressPct = Math.round((stats.totalSupply / stats.maxSupply) * 100)

  return (
    <div className="flex flex-col gap-6">
      {/* Supply progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">Minted</span>
          <span className="font-mono text-slate-200">
            {stats.totalSupply} / {stats.maxSupply}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs text-slate-500">
          {stats.maxSupply - stats.totalSupply} remaining
        </p>
      </div>

      {/* Pricing tiers */}
      <div className="grid gap-3 sm:grid-cols-3">
        {PRICE_TIERS.map((tier) => {
          const active =
            stats.totalSupply >= tier.threshold &&
            stats.totalSupply < tier.maxTokens
          return (
            <div
              key={tier.label}
              className={`rounded-xl border p-3 text-center transition-all ${
                active
                  ? 'border-cyan-500/50 bg-cyan-950/30 shadow-[0_0_16px_rgba(34,211,238,0.1)]'
                  : 'border-slate-700/50 bg-slate-900/40 opacity-60'
              }`}
            >
              {active && (
                <span className="mb-1.5 inline-block rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-400">
                  Current
                </span>
              )}
              <p className="text-sm font-medium text-slate-200">{tier.label}</p>
              <p className="text-xs text-slate-500">{tier.range}</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">{tier.price} ETH</p>
            </div>
          )
        })}
      </div>

      {/* Status messages */}
      {!stats.mintingEnabled && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-400">
          ⚠️ Minting is currently paused.
        </div>
      )}

      {stats.hasMinted && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-300">
          ✅ This wallet has already minted a Lifetime Pass.
        </div>
      )}

      {isWrongNetwork && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          ⚠️ Please switch to Base network to mint.
        </div>
      )}

      {/* Transaction status */}
      {txHash && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs">
          <p className="text-slate-400">
            TX:{' '}
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-cyan-400 hover:underline"
            >
              {txHash}
            </a>
          </p>
          {isConfirming && <p className="mt-1 text-yellow-400">⏳ Confirming transaction…</p>}
          {isConfirmed && !verified && (
            <p className="mt-1 text-green-400">✅ Confirmed! Click below to activate your tier.</p>
          )}
        </div>
      )}

      {upgradeMessage && (
        <div className="rounded-xl border border-green-500/30 bg-green-950/20 px-4 py-3 text-sm text-green-400">
          {upgradeMessage}
        </div>
      )}

      {verifyError && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {verifyError}
        </div>
      )}

      {writeError && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {writeError.message.split('\n')[0]}
        </div>
      )}

      {/* Current price */}
      <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/40 px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">Current Price ({priceTier})</p>
          <p className="font-mono text-2xl font-bold text-white">{priceInEth} ETH</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Tier</p>
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
            Lifetime Pass
          </span>
        </div>
      </div>

      {/* Mint button */}
      {isConnected ? (
        isConfirmed && !verified ? (
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-green-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? 'Sign in wallet to verify…' : 'Sign & Activate Lifetime Tier'}
          </button>
        ) : (
          <button
            onClick={handleMint}
            disabled={
              isPending ||
              isConfirming ||
              !stats.mintingEnabled ||
              stats.hasMinted ||
              isWrongNetwork ||
              !CLIENT_NFT_CONTRACT_ADDRESS
            }
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_32px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? 'Confirm in wallet…'
              : isConfirming
              ? 'Confirming…'
              : stats.hasMinted
              ? 'Already Minted'
              : `Mint for ${priceInEth} ETH`}
          </button>
        )
      ) : null}
    </div>
  )
}
