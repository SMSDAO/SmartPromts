import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const user = authResult

  // Only admins and developers can view metrics
  if (user.subscription_tier !== 'admin' && user.subscription_tier !== 'developer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const metrics = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
    runtime: {
      node_version: process.version,
      platform: process.platform,
      memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptime_seconds: Math.round(process.uptime()),
    },
    environment: process.env.NODE_ENV ?? 'production',
    services: {
      supabase: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not_configured',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      redis: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'not_configured',
    },
  }

  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
