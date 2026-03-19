'use client'

import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface AnimatedBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /** Colour theme */
  theme?: 'default' | 'purple' | 'cyan' | 'multi'
}

/**
 * Full-screen animated gradient background with floating orb accents.
 * Place this as the first child of a relative/absolute container.
 */
export function AnimatedBackground({
  theme = 'default',
  className,
  ...props
}: AnimatedBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        className,
      )}
      {...props}
    >
      {/* Base gradient */}
      <div
        className={clsx('absolute inset-0 transition-all duration-1000', {
          'bg-gradient-to-br from-gray-950 via-blue-950/30 to-gray-950': theme === 'default',
          'bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950': theme === 'purple',
          'bg-gradient-to-br from-gray-950 via-cyan-950/30 to-gray-950': theme === 'cyan',
          'bg-gradient-to-br from-indigo-950 via-purple-950/50 to-cyan-950/30': theme === 'multi',
        })}
      />

      {/* Floating orb 1 */}
      <div
        className={clsx(
          'absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl',
          'animate-[pulse_8s_ease-in-out_infinite]',
          {
            'bg-blue-600': theme === 'default' || theme === 'multi',
            'bg-purple-600': theme === 'purple',
            'bg-cyan-500': theme === 'cyan',
          },
        )}
      />

      {/* Floating orb 2 */}
      <div
        className={clsx(
          'absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl',
          'animate-[pulse_10s_ease-in-out_2s_infinite]',
          {
            'bg-cyan-500': theme === 'default',
            'bg-pink-600': theme === 'purple' || theme === 'multi',
            'bg-blue-500': theme === 'cyan',
          },
        )}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}
