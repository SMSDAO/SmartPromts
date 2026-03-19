import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
})

const _parsed = envSchema.safeParse(process.env)

if (!_parsed.success) {
  const missing = _parsed.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ')
  throw new Error(`[env] Missing or invalid environment variables: ${missing}`)
}

export const env = _parsed.data
