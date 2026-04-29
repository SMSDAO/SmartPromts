/**
 * Zod schema definition for application configuration.
 *
 * Exported separately so unit tests can validate the schema without importing
 * the full `lib/config` module (which performs env-var parsing at load time
 * and throws when required variables are absent).
 */

import { z } from 'zod'

export const configSchema = z.object({
  /** Supabase project settings */
  supabase: z.object({
    url: z.string().url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' }),
    anonKey: z.string().min(1, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' }),
    serviceRoleKey: z
      .string()
      .min(1, { message: 'SUPABASE_SERVICE_ROLE_KEY must be non-empty if provided' })
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
    chainId: z.coerce.number().default(8453),
    rpcUrl: z.string().url().optional(),
  }),

  /** WalletConnect – optional */
  walletConnect: z.object({
    projectId: z.string().optional(),
  }),
})

export type AppConfig = z.infer<typeof configSchema>
