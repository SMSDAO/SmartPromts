import { Suspense } from 'react'
import { getNFTStats } from '@/lib/nft'
import { MintPageClient } from './MintPageClient'

export const metadata = {
  title: 'Mint Lifetime Pass — SmartPromts',
  description: 'Mint your SmartPromts Lifetime Pass NFT on Base network for unlimited prompt optimizations forever.',
}

export default async function MintPage() {
  // Fetch NFT stats server-side for initial render
  let stats = {
    totalSupply: 0,
    maxSupply: 1000,
    mintingEnabled: false,
    currentPrice: BigInt(50000000000000000), // 0.05 ETH fallback
  }

  try {
    const onChainStats = await getNFTStats()
    stats = {
      totalSupply: Number(onChainStats.totalSupply),
      maxSupply: Number(onChainStats.maxSupply),
      mintingEnabled: onChainStats.mintingEnabled,
      currentPrice: onChainStats.currentPrice,
    }
  } catch {
    // Contract not deployed yet or RPC error — use defaults
  }

  return (
    <Suspense fallback={<MintPageSkeleton />}>
      <MintPageClient stats={stats} />
    </Suspense>
  )
}

function MintPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-pulse text-slate-500">Loading…</div>
    </div>
  )
}
