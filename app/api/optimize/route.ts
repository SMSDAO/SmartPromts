import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, upsertUser } from '@/lib/auth'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { rateLimit } from '@/lib/rate-limit'
import { optimizePrompt } from '@/lib/openai'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'

const OptimizeSchema = z.object({
  prompt: z.string().min(1).max(10000),
  model: z.string().optional(),
  context: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from session
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const email = session.user.email || ''

    // Upsert user to ensure they exist in database
    const user = await upsertUser(userId, email)

    // Check if user is banned
    if (user.banned) {
      return NextResponse.json(
        { error: 'Account banned - Please contact support' },
        { status: 403 }
      )
    }

    // Rate limiting - 10 requests per minute per user
    const rateLimitResult = rateLimit(`optimize:${userId}`, {
      interval: 60 * 1000,
      limit: 10,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { status: 429 }
      )
    }

    // Check usage limit
    const usageCheck = await checkUsageLimit(userId, user.subscription_tier)

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit reached',
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
          resetAt: usageCheck.resetAt,
          tier: user.subscription_tier,
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = OptimizeSchema.parse(body)

    // Optimize the prompt
    const result = await optimizePrompt({
      prompt: validatedData.prompt,
      model: validatedData.model,
      context: validatedData.context,
    })

    // Increment usage count (log error but continue if it fails to avoid blocking user)
    try {
      await incrementUsage(userId)
    } catch (usageError) {
      console.error('Failed to increment usage (non-blocking):', usageError)
      // Continue - usage tracking failure shouldn't block the optimization result
    }

    // Return result with usage info
    return NextResponse.json({
      success: true,
      data: result,
      usage: {
        remaining: usageCheck.limit === -1 ? -1 : usageCheck.remaining - 1,
        limit: usageCheck.limit,
        resetAt: usageCheck.resetAt,
        tier: user.subscription_tier,
      },
    })
  } catch (error) {
    console.error('Optimize API error:', error)

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
