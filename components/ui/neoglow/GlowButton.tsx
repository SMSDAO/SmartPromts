import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}

const variantClasses: Record<NonNullable<GlowButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/40 hover:shadow-blue-500/70 border-blue-500/50',
  secondary:
    'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-500/40 hover:shadow-purple-500/70 border-purple-500/50',
  danger:
    'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-red-500/40 hover:shadow-red-500/70 border-red-500/50',
  ghost:
    'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:border-white/40 shadow-none',
}

const sizeClasses: Record<NonNullable<GlowButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
}

/**
 * Animated glow button with optional pulse effect.
 */
export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  pulse = false,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        'relative inline-flex items-center justify-center font-semibold',
        'border shadow-lg transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'hover:scale-[1.03] active:scale-95',
        variantClasses[variant],
        sizeClasses[size],
        pulse && !disabled && 'animate-pulse',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
