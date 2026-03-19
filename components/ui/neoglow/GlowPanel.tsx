import { type ReactNode, type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface GlowPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Optional panel heading */
  title?: string
  /** Optional subtitle / description */
  description?: string
  /** Right-side header slot for actions / badges */
  headerAction?: ReactNode
  variant?: 'default' | 'dark' | 'gradient'
}

const variantClasses: Record<NonNullable<GlowPanelProps['variant']>, string> = {
  default: 'bg-white/5 border-white/10',
  dark: 'bg-black/30 border-white/5',
  gradient: 'bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-cyan-900/20 border-blue-500/20',
}

/**
 * Structured panel with optional glow-styled header.
 * Use for dashboard cards, info panes, and activity feeds.
 */
export function GlowPanel({
  children,
  title,
  description,
  headerAction,
  variant = 'default',
  className,
  ...props
}: GlowPanelProps) {
  const hasHeader = title || description || headerAction

  return (
    <div
      className={clsx(
        'rounded-2xl border backdrop-blur-md shadow-lg',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div className="space-y-0.5">
            {title && (
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
