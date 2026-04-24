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

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const configSchema = z.object({
  /** Supabase project settings */
  supabase: z.object({
    url: z.string().url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' }),
    anonKey: z.string().min(1, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' }),
    serviceRoleKey: z
      .string()
      .min(1, { message: 'SUPABASE_SERVICE_ROLE_KEY is required' })
      .optional(),
  }),

  /** OpenAI settings */
  openai: z.object({
    apiKey: z.string().min(1, { message: 'OPENAI_API_KEY is required' }),
    defaultModel: z.string().default('gpt-4-turbo-preview'),
  }),

  /** Stripe billing settings */
  stripe: z.object({
    secretKey: z.string().min(1).optional(),
    publishableKey: z.string().min(1).optional(),
    webhookSecret: z.string().min(1).optional(),
    priceIds: z.object({
      free: z.string().default(''),
      pro: z.string().default(''),
      enterprise: z.string().default(''),
      lifetime: z.string().default(''),
    }),
  }),

  /** Upstash Redis – optional; enables distributed rate limiting */
  upstash: z.object({
    restUrl: z.string().url().optional(),
    restToken: z.string().min(1).optional(),
  }),

  /** Application-level settings */
  app: z.object({
    url: z.string().url().default('http://localhost:3000'),
    nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
    version: z.string().default('1.0.0'),
  }),

  /** NFT contract settings – optional */
  nft: z.object({
    contractAddress: z.string().optional(),
    publicContractAddress: z.string().optional(),
    chainId: z.coerce.number().optional(),
    rpcUrl: z.string().url().optional(),
  }),

  /** WalletConnect – optional */
  walletConnect: z.object({
    projectId: z.string().optional(),
  }),
})

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

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

/** Inferred TypeScript type for the validated config object. */
export type AppConfig = z.infer<typeof configSchema>
