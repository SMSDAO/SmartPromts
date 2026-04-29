/**
 * Zod schemas for authentication-related API payloads.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Sign-in / Sign-up
// ---------------------------------------------------------------------------

export const SignInSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must be at most 128 characters' }),
})

export type SignIn = z.infer<typeof SignInSchema>

export const SignUpSchema = SignInSchema.extend({
  /** Optional display name collected at registration */
  name: z.string().min(1).max(100).optional(),
})

export type SignUp = z.infer<typeof SignUpSchema>

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export const PasswordResetRequestSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required' }),
})

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128),
})

export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export const SessionUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  subscription_tier: z.enum([
    'free',
    'pro',
    'enterprise',
    'lifetime',
    'admin',
    'developer',
    'auditor',
  ]),
})

export type SessionUser = z.infer<typeof SessionUserSchema>
