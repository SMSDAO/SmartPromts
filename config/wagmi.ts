'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'

// A placeholder project ID is used when the env var is not set (e.g. during
// `next build` in CI). Real WalletConnect connections require a valid project
// ID from https://cloud.walletconnect.com.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

if (!projectId) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[SmartPromts] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. ' +
        'WalletConnect connections will not work. ' +
        'Get a project ID at https://cloud.walletconnect.com.'
    )
  }
}

export const wagmiConfig = getDefaultConfig({
  appName: 'SmartPromts',
  projectId: projectId || 'PLACEHOLDER_SET_IN_ENV',
  chains: [base, baseSepolia],
  ssr: true,
})
