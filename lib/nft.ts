/**
 * Server-side NFT verification utilities using viem.
 * Calls the SmartPromtsLifetimePass contract on Base network.
 */

import { createPublicClient, http, isAddress } from 'viem'
import { base } from 'viem/chains'
import {
  SMARTPROMTS_LIFETIME_PASS_ABI,
  NFT_CONTRACT_ADDRESS,
} from './contracts/SmartPromtsLifetimePass'

function getPublicClient() {
  const rpcUrl = process.env.BASE_RPC_URL ?? 'https://mainnet.base.org'
  return createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  })
}

/**
 * Verify whether a wallet address holds a SmartPromts Lifetime Pass NFT.
 *
 * Throws for invalid wallet address format (caller should validate before
 * calling). Returns false — rather than throwing — for contract or network
 * errors so the API layer can surface a clean error response.
 */
export async function verifyLifetimePass(walletAddress: string): Promise<boolean> {
  if (!isAddress(walletAddress)) {
    throw new Error(`Invalid wallet address: ${walletAddress}`)
  }

  if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === '0x') {
    console.warn('NFT_CONTRACT_ADDRESS is not configured — returning false')
    return false
  }

  const client = getPublicClient()

  try {
    const hasPass = await client.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: SMARTPROMTS_LIFETIME_PASS_ABI,
      functionName: 'hasLifetimePass',
      args: [walletAddress as `0x${string}`],
    })
    return Boolean(hasPass)
  } catch (err) {
    console.error('verifyLifetimePass contract call failed:', err)
    return false
  }
}

/**
 * Get current mint price (in wei) from the contract.
 */
export async function getCurrentMintPrice(): Promise<bigint> {
  if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === '0x') {
    return BigInt(0)
  }

  const client = getPublicClient()

  try {
    return await client.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: SMARTPROMTS_LIFETIME_PASS_ABI,
      functionName: 'getCurrentPrice',
    })
  } catch (err) {
    console.error('getCurrentMintPrice contract call failed:', err)
    return BigInt(0)
  }
}

/**
 * Get current total supply and whether minting is enabled.
 */
export async function getNFTStats(): Promise<{
  totalSupply: bigint
  maxSupply: bigint
  mintingEnabled: boolean
  currentPrice: bigint
}> {
  if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === '0x') {
    return {
      totalSupply: BigInt(0),
      maxSupply: BigInt(1000),
      mintingEnabled: false,
      currentPrice: BigInt(0),
    }
  }

  const client = getPublicClient()

  const [totalSupply, maxSupply, mintingEnabled, currentPrice] =
    await Promise.all([
      client.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: SMARTPROMTS_LIFETIME_PASS_ABI,
        functionName: 'totalSupply',
      }),
      client.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: SMARTPROMTS_LIFETIME_PASS_ABI,
        functionName: 'MAX_SUPPLY',
      }),
      client.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: SMARTPROMTS_LIFETIME_PASS_ABI,
        functionName: 'mintingEnabled',
      }),
      client.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: SMARTPROMTS_LIFETIME_PASS_ABI,
        functionName: 'getCurrentPrice',
      }),
    ])

  return {
    totalSupply: totalSupply as bigint,
    maxSupply: maxSupply as bigint,
    mintingEnabled: mintingEnabled as boolean,
    currentPrice: currentPrice as bigint,
  }
}
