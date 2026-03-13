'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'

/**
 * Themed wallet connect button matching the SmartPromts neo-glow dark design.
 * Wraps RainbowKit's ConnectButton with custom styling.
 */
export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        if (!ready) {
          return (
            <div
              aria-hidden
              className="h-9 w-32 animate-pulse rounded-lg bg-slate-800"
            />
          )
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className="relative inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-900/80 px-4 py-2 text-sm font-medium text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Connect Wallet
            </button>
          )
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-slate-900/80 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:border-red-400/70"
            >
              Wrong Network
            </button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openChainModal}
              type="button"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 sm:flex"
            >
              {chain.hasIcon && chain.iconUrl && (
                  <Image
                    alt={chain.name ?? 'Chain icon'}
                    src={chain.iconUrl}
                    width={14}
                    height={14}
                    className="rounded-full"
                    unoptimized
                  />
                )}
              {chain.name}
            </button>
            <button
              onClick={openAccountModal}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-900/80 px-4 py-2 text-sm font-medium text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            >
              {account.displayName}
            </button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
