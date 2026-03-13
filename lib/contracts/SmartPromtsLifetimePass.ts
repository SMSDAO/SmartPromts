/**
 * SmartPromts Lifetime Pass NFT contract — ABI and address config
 * Deployed on Base (chain ID 8453)
 */

export const SMARTPROMTS_LIFETIME_PASS_ABI = [
  // View functions
  {
    name: 'hasLifetimePass',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getCurrentPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'MAX_SUPPLY',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'mintingEnabled',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'hasMinted',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // State-changing functions
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  // Events
  {
    name: 'LifetimePassMinted',
    type: 'event',
    inputs: [
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'price', type: 'uint256', indexed: false },
    ],
  },
] as const

/**
 * Server-only contract address (not prefixed with NEXT_PUBLIC_).
 * Only use this in API routes / server components.
 */
export const NFT_CONTRACT_ADDRESS =
  (process.env.NFT_CONTRACT_ADDRESS ?? '') as `0x${string}`

/**
 * Client-safe contract address exposed via NEXT_PUBLIC_NFT_CONTRACT_ADDRESS.
 * Use this in client components (MintNFT, MintPageClient, etc.) so that the
 * address is bundled into the client JavaScript.
 *
 * Note: if only NFT_CONTRACT_ADDRESS is set (no NEXT_PUBLIC_ variant) the
 * client address will be empty. Make sure to set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
 * in your .env / Vercel environment variables.
 */
export const CLIENT_NFT_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ?? '') as `0x${string}`

export const BASE_CHAIN_ID = 8453
export const BASE_SEPOLIA_CHAIN_ID = 84532
