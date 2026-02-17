'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // During build time, return a mock for SSG
    if (typeof window === 'undefined') {
      console.warn('Supabase env vars not configured at build time')
      return null as any
    }
    // At runtime in browser, throw error
    const message = 'Supabase env vars not configured'
    console.error(message)
    throw new Error(message)
  }

  return createBrowserClient(url, key)
}
