import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-side Supabase client with auth context
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client for privileged operations
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: 'free' | 'pro' | 'enterprise'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          usage_count: number
          usage_reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          usage_count?: number
          usage_reset_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          usage_count?: number
          usage_reset_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
