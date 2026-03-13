'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'

// A placeholder project ID is used when the env var is not set (e.g. during
// `next build` in CI). Real WalletConnect connections require a valid project
// ID from https://cloud.walletconnect.com.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'PLACEHOLDER_SET_IN_ENV'

export const wagmiConfig = getDefaultConfig({
  appName: 'SmartPromts',
  projectId,
  chains: [base, baseSepolia],
  ssr: true,
})
