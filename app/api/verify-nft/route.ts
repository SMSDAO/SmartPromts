import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { verifyLifetimePass } from '@/lib/nft'
import { createAdminClient } from '@/lib/supabase'
import { isAddress, verifyMessage } from 'viem'
import { z } from 'zod'

const VerifyNFTSchema = z.object({
  walletAddress: z
    .string()
    .min(1)
    .refine((addr) => isAddress(addr), {
      message: 'Invalid Ethereum wallet address',
    }),
  /**
   * Optional EIP-191 `personal_sign` signature of the ownership-proof message.
   * When provided, the server verifies the signature before upgrading the tier.
   * When omitted, the endpoint performs a read-only check (no upgrade).
   */
  signature: z.string().optional(),
  /** When true, only check NFT ownership — do not upgrade tier regardless of result. */
  checkOnly: z.boolean().optional(),
})

/** Build the same deterministic message the client signs. */
function ownershipMessage(walletAddress: string): string {
  return `Verify SmartPromts Lifetime Pass ownership.\nAddress: ${walletAddress.toLowerCase()}`
}

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

    const { walletAddress, signature, checkOnly } = parsed.data

    // Check NFT ownership on-chain
    const hasPass = await verifyLifetimePass(walletAddress)

    // -----------------------------------------------------------------------
    // Tier upgrade logic
    // -----------------------------------------------------------------------
    // An upgrade requires BOTH:
    //   1. The wallet holds a Lifetime Pass (on-chain), AND
    //   2. The caller proves they own that wallet by providing a valid
    //      EIP-191 signature of the ownership-proof message.
    //
    // Without the signature, any authenticated user could submit someone
    // else's wallet address and get their own account upgraded for free.
    // -----------------------------------------------------------------------

    let upgraded = false

    const wantsUpgrade =
      hasPass &&
      !checkOnly &&
      signature &&
      user.subscription_tier !== 'lifetime' &&
      user.subscription_tier !== 'admin'

    if (wantsUpgrade) {
      // Verify the signature proves the caller controls the wallet
      const message = ownershipMessage(walletAddress)
      let signatureValid = false
      try {
        signatureValid = await verifyMessage({
          address: walletAddress as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        })
      } catch {
        // Invalid signature format — treat as unverified
        signatureValid = false
      }

      if (!signatureValid) {
        return NextResponse.json(
          { error: 'Invalid wallet signature. Please sign the verification message.' },
          { status: 403 }
        )
      }

      // Signature is valid — upgrade the tier
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
