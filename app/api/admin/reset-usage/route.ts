import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminClient } from '@/lib/require-admin'
import { z } from 'zod'

const ResetUsageSchema = z.object({
  userId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const adminUser = await requireAdmin()
    if (adminUser instanceof NextResponse) {
      return adminUser
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = ResetUsageSchema.parse(body)

    // Use admin client to reset usage
    const supabaseAdmin = getAdminClient()
    const resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        usage_count: 0,
        usage_reset_at: resetAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to reset usage: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Reset usage API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
