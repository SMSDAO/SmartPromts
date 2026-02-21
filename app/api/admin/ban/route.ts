import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminClient } from '@/lib/require-admin'
import { z } from 'zod'

const BanSchema = z.object({
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
    const validatedData = BanSchema.parse(body)

    // Use admin client to ban user
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        banned: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to ban user: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Ban user API error:', error)

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
