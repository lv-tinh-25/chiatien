import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

// `value` is omitted from the button attributes: it means something else
// there, and this component's own value is a formatted amount.
type StatBarProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> & {
  label: ReactNode
  value: ReactNode
  /** 0 to 1. */
  fill: number
  tone?: 'primary' | 'secondary'
  /** Render as a button so it can act as a dialog trigger. */
  asButton?: boolean
  selectLabel?: string
}

function Body({
  label,
  value,
  fill,
  tone,
}: Pick<StatBarProps, 'label' | 'value' | 'fill' | 'tone'>) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-body-md text-foreground">
          {label}
        </span>
        <span className="shrink-0 tabular text-numeric-table-md text-foreground">
          {value}
        </span>
      </span>
      <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-foreground/8">
        <span
          className={cn(
            'block h-full rounded-full transition-[width] duration-500 ease-out-soft',
            tone === 'secondary' ? 'bg-secondary' : 'bg-primary',
          )}
          style={{
            width: `${Math.round(Math.max(0, Math.min(1, fill)) * 100)}%`,
          }}
        />
      </span>
    </>
  )
}

export const StatBar = forwardRef<HTMLButtonElement, StatBarProps>(
  function StatBar(
    { label, value, fill, tone, asButton = false, selectLabel, ...props },
    ref,
  ) {
    if (!asButton) {
      return (
        <li className="py-2">
          <Body label={label} value={value} fill={fill} tone={tone} />
        </li>
      )
    }

    return (
      <li>
        <button
          ref={ref}
          type="button"
          aria-label={selectLabel}
          className="w-full cursor-pointer rounded-control px-2 py-2 text-left transition-colors duration-150 ease-out-soft hover:bg-foreground/5"
          {...props}
        >
          <Body label={label} value={value} fill={fill} tone={tone} />
        </button>
      </li>
    )
  },
)
