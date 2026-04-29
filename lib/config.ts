/**
 * Centralized, Zod-validated application configuration.
 *
 * Groups all environment variables by category and validates them at startup.
 * Provides type-safe access with autocomplete throughout the application.
 *
 * Optional variables (Redis, NFT, WalletConnect) do not prevent startup when
 * absent so that local development and CI builds work without every service
 * configured.
 */

import 'server-only'
import { configSchema } from './config.schema'

export { configSchema } from './config.schema'
export type { AppConfig } from './config.schema'

function buildRawConfig() {
  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: process.env.OPENAI_DEFAULT_MODEL,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      priceIds: {
        free: process.env.STRIPE_PRICE_ID_FREE,
        pro: process.env.STRIPE_PRICE_ID_PRO,
        enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
        lifetime: process.env.STRIPE_PRICE_ID_LIFETIME,
      },
    },
    upstash: {
      restUrl: process.env.UPSTASH_REDIS_REST_URL,
      restToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    },
    nft: {
      contractAddress: process.env.NFT_CONTRACT_ADDRESS,
      publicContractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
      chainId: process.env.BASE_CHAIN_ID,
      rpcUrl: process.env.BASE_RPC_URL,
    },
    walletConnect: {
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    },
  }
}

const _parsed = configSchema.safeParse(buildRawConfig())

if (!_parsed.success) {
  const issues = _parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(`[config] Invalid or missing configuration:\n${issues}`)
}

/** Type-safe, validated application configuration grouped by service. */
export const config = _parsed.data
