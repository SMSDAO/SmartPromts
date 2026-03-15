import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  const status = {
    status: 'ok',
    version: process.env.npm_package_version ?? '1.0.0',
    timestamp: new Date().toISOString(),
    latency_ms: Date.now() - startTime,
  }

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
