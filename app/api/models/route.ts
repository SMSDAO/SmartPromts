import { NextResponse } from 'next/server'
import { listModels } from '@/core/orchestrator/model-registry'

export async function GET() {
  try {
    const models = listModels()
    return NextResponse.json({ models })
  } catch (error) {
    console.error('GET /api/models error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
