import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminClient } from '@/lib/require-admin'
import { z } from 'zod'

const UpdateTierSchema = z.object({
  userId: z.string().uuid(),
  tier: z.enum(['free', 'pro', 'enterprise', 'lifetime', 'admin']),
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
    const validatedData = UpdateTierSchema.parse(body)

    // Prevent admins from demoting themselves
    if (adminUser.id === validatedData.userId && validatedData.tier !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own admin status. Have another admin modify your tier.' },
        { status: 403 }
      )
    }

    // Use admin client to update user tier
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        subscription_tier: validatedData.tier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update tier: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Update tier API error:', error)

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
