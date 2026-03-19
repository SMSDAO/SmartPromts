import { type ReactNode, type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Glow colour variant */
  variant?: 'blue' | 'purple' | 'cyan' | 'green' | 'pink'
  /** Show shimmer animation */
  shimmer?: boolean
}

const variantClasses: Record<NonNullable<GlowCardProps['variant']>, string> = {
  blue: 'shadow-blue-500/20 border-blue-500/30 hover:shadow-blue-500/40 hover:border-blue-500/60',
  purple: 'shadow-purple-500/20 border-purple-500/30 hover:shadow-purple-500/40 hover:border-purple-500/60',
  cyan: 'shadow-cyan-500/20 border-cyan-500/30 hover:shadow-cyan-500/40 hover:border-cyan-500/60',
  green: 'shadow-green-500/20 border-green-500/30 hover:shadow-green-500/40 hover:border-green-500/60',
  pink: 'shadow-pink-500/20 border-pink-500/30 hover:shadow-pink-500/40 hover:border-pink-500/60',
}

/**
 * Glassmorphism card with animated glow border effect.
 */
export function GlowCard({
  children,
  variant = 'blue',
  shimmer = false,
  className,
  ...props
}: GlowCardProps) {
  return (
    <div
      className={clsx(
        'relative rounded-2xl border bg-white/5 backdrop-blur-md',
        'shadow-lg transition-all duration-300',
        variantClasses[variant],
        shimmer && 'overflow-hidden',
        className,
      )}
      {...props}
    >
      {shimmer && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      )}
      {children}
    </div>
  )
}
