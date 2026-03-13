import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { verifyLifetimePass } from '@/lib/nft'
import { createAdminClient } from '@/lib/supabase'
import { isAddress } from 'viem'
import { z } from 'zod'

const VerifyNFTSchema = z.object({
  walletAddress: z
    .string()
    .min(1)
    .refine((addr) => isAddress(addr), {
      message: 'Invalid Ethereum wallet address',
    }),
})

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const parsed = VerifyNFTSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const { walletAddress } = parsed.data

    // Check NFT ownership on-chain
    const hasPass = await verifyLifetimePass(walletAddress)

    let upgraded = false

    // Auto-upgrade subscription tier if user holds a Lifetime Pass
    if (hasPass && user.subscription_tier !== 'lifetime' && user.subscription_tier !== 'admin') {
      const adminClient = createAdminClient()
      const { error } = await adminClient
        .from('users')
        .update({
          subscription_tier: 'lifetime',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        console.error('Failed to upgrade user tier:', error)
      } else {
        upgraded = true
      }
    }

    return NextResponse.json({ hasPass, upgraded })
  } catch (error) {
    console.error('NFT verification error:', error)

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
