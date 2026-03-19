import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface GlowInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  variant?: 'blue' | 'purple' | 'cyan'
}

const variantFocus: Record<NonNullable<GlowInputProps['variant']>, string> = {
  blue: 'focus:border-blue-500 focus:shadow-blue-500/30',
  purple: 'focus:border-purple-500 focus:shadow-purple-500/30',
  cyan: 'focus:border-cyan-500 focus:shadow-cyan-500/30',
}

/**
 * Glassmorphism input with animated glow on focus.
 */
export const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  function GlowInput({ label, error, variant = 'blue', className, id, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white',
            'backdrop-blur-sm placeholder-gray-500 outline-none',
            'border-white/10 shadow-sm transition-all duration-300',
            'focus:shadow-lg',
            variantFocus[variant],
            error && 'border-red-500/60 focus:border-red-500 focus:shadow-red-500/30',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)
