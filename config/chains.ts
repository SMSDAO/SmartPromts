/**
 * Web3 chain configuration for SmartPromts
 *
 * Supports EVM chains (Base, Ethereum, Polygon), Solana, and
 * WalletConnect-compatible wallet authentication.
 */

export interface ChainConfig {
  id: number
  name: string
  network: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  isTestnet?: boolean
}

export interface SolanaChainConfig {
  id: string
  name: string
  network: string
  rpcUrl: string
  clusterApiUrl: string
  blockExplorer: string
}

// ---------------------------------------------------------------------------
// EVM Chains
// ---------------------------------------------------------------------------

export const ETHEREUM: ChainConfig = {
  id: 1,
  name: 'Ethereum Mainnet',
  network: 'ethereum',
  rpcUrl: process.env.ETHEREUM_RPC_URL ?? 'https://eth.llamarpc.com',
  blockExplorer: 'https://etherscan.io',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

export const BASE: ChainConfig = {
  id: 8453,
  name: 'Base',
  network: 'base',
  rpcUrl: process.env.BASE_RPC_URL ?? 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

export const BASE_SEPOLIA: ChainConfig = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  isTestnet: true,
}

export const POLYGON: ChainConfig = {
  id: 137,
  name: 'Polygon',
  network: 'polygon',
  rpcUrl: process.env.POLYGON_RPC_URL ?? 'https://polygon-rpc.com',
  blockExplorer: 'https://polygonscan.com',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
}

// ---------------------------------------------------------------------------
// Solana
// ---------------------------------------------------------------------------

export const SOLANA_MAINNET: SolanaChainConfig = {
  id: 'solana-mainnet',
  name: 'Solana Mainnet',
  network: 'mainnet-beta',
  rpcUrl: process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com',
  clusterApiUrl: 'https://api.mainnet-beta.solana.com',
  blockExplorer: 'https://solscan.io',
}

export const SOLANA_DEVNET: SolanaChainConfig = {
  id: 'solana-devnet',
  name: 'Solana Devnet',
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com',
  clusterApiUrl: 'https://api.devnet.solana.com',
  blockExplorer: 'https://solscan.io/?cluster=devnet',
}

// ---------------------------------------------------------------------------
// Chain registry
// ---------------------------------------------------------------------------

/** All supported EVM chains */
export const EVM_CHAINS: ChainConfig[] = [ETHEREUM, BASE, BASE_SEPOLIA, POLYGON]

/** Supported mainnet EVM chains (non-testnet) */
export const EVM_MAINNET_CHAINS: ChainConfig[] = EVM_CHAINS.filter(
  (c) => !c.isTestnet
)

/** Lookup EVM chain by ID */
export function getChainById(chainId: number): ChainConfig | undefined {
  return EVM_CHAINS.find((c) => c.id === chainId)
}

// ---------------------------------------------------------------------------
// WalletConnect
// ---------------------------------------------------------------------------

export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ''

/** Chains supported for WalletConnect wallet authentication */
export const WALLET_CONNECT_CHAINS: ChainConfig[] = [BASE, ETHEREUM, POLYGON]

// ---------------------------------------------------------------------------
// NFT contract (Base)
// ---------------------------------------------------------------------------

export const NFT_CONTRACT = {
  address: process.env.NFT_CONTRACT_ADDRESS ?? '',
  chainId: BASE.id,
  chain: BASE,
}

// ---------------------------------------------------------------------------
// Signature verification helpers
// ---------------------------------------------------------------------------

/** Standard SIWE (Sign-In with Ethereum) message domain */
export const SIWE_DOMAIN =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') ?? 'localhost'

/** EIP-4361 Sign-In with Ethereum statement */
export const SIWE_STATEMENT =
  'Sign in to SmartPromts to verify wallet ownership.'
