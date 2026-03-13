'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MintNFT } from '@/components/MintNFT'
import {
  SMARTPROMTS_LIFETIME_PASS_ABI,
  NFT_CONTRACT_ADDRESS,
} from '@/lib/contracts/SmartPromtsLifetimePass'

interface MintPageClientProps {
  stats: {
    totalSupply: number
    maxSupply: number
    mintingEnabled: boolean
    currentPrice: bigint
  }
}

export function MintPageClient({ stats: serverStats }: MintPageClientProps) {
  const { address, isConnected } = useAccount()
  const [refreshKey, setRefreshKey] = useState(0)

  // Read whether current wallet has already minted
  const { data: hasMinted } = useReadContract({
    address: NFT_CONTRACT_ADDRESS || undefined,
    abi: SMARTPROMTS_LIFETIME_PASS_ABI,
    functionName: 'hasMinted',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!NFT_CONTRACT_ADDRESS },
  })

  const mintStats = {
    ...serverStats,
    hasMinted: Boolean(hasMinted),
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08)_0%,transparent_60%)]">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-bold text-white">
            Smart<span className="text-cyan-400">Promts</span>
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-4 py-1.5 text-sm text-cyan-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            Live on Base Network
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            SmartPromts{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Lifetime Pass
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Own your access forever. One NFT = unlimited prompt optimizations for life.
            No subscriptions, no recurring fees.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Benefits */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">What you get</h2>
              <ul className="space-y-3">
                {[
                  { icon: '♾️', text: 'Unlimited prompt optimizations, forever' },
                  { icon: '⚡', text: 'Priority processing — no queue' },
                  { icon: '🤖', text: 'Access to all AI models (GPT-4, Claude, Gemini)' },
                  { icon: '🔑', text: 'Early access to new features' },
                  { icon: '🏛️', text: 'Community governance voting rights' },
                  { icon: '💎', text: 'Transferable — sell or gift anytime' },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 text-base leading-none">{icon}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contract info */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Contract Details</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Network</dt>
                  <dd className="font-medium text-slate-200">Base (Chain ID 8453)</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Max Supply</dt>
                  <dd className="font-medium text-slate-200">{serverStats.maxSupply}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Minted</dt>
                  <dd className="font-medium text-slate-200">{serverStats.totalSupply}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Standard</dt>
                  <dd className="font-medium text-slate-200">ERC-721</dd>
                </div>
                {NFT_CONTRACT_ADDRESS && (
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-slate-500">Contract</dt>
                    <dd className="break-all text-right font-mono text-xs text-cyan-400">
                      <a
                        href={`https://basescan.org/address/${NFT_CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {NFT_CONTRACT_ADDRESS}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Right: Mint card */}
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-[0_0_60px_rgba(34,211,238,0.06)] backdrop-blur-sm">
            <h2 className="mb-6 text-lg font-semibold text-white">Mint Your Pass</h2>

            {!isConnected ? (
              <div className="flex flex-col items-center gap-6 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/60 ring-1 ring-cyan-500/30">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="mb-1 text-base font-medium text-white">Connect your wallet</p>
                  <p className="text-sm text-slate-400">
                    Connect a Base-compatible wallet to mint your Lifetime Pass
                  </p>
                </div>
                <ConnectButton />
              </div>
            ) : (
              <MintNFT
                key={refreshKey}
                stats={mintStats}
                onMintSuccess={() => setRefreshKey((k) => k + 1)}
              />
            )}
          </div>
        </div>

        {/* Current price callout */}
        <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-6 text-center">
          <p className="text-sm text-slate-400">Current price</p>
          <p className="mt-1 font-mono text-4xl font-bold text-white">
            {formatEther(serverStats.currentPrice)} ETH
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Price increases as more passes are minted — early adopters save the most.
          </p>
        </div>
      </main>
    </div>
  )
}
