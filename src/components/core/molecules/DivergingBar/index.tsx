import { cn } from '@/lib/utils'

const SIZES = {
  sm: { track: 'h-2', axis: '-inset-y-0.5' },
  md: { track: 'h-3.5', axis: '-inset-y-1' },
}

/**
 * Diverges from a centre axis rather than filling from the left, so being owed
 * and owing are told apart by direction as well as by colour — the only
 * encoding a red/green-blind viewer can still read.
 *
 * The width is an inline style because it is data, not a design decision: a
 * Tailwind class cannot carry a percentage computed at render time.
 */
export function DivergingBar({
  total,
  scale,
  size = 'md',
  className,
}: {
  total: number
  /** Widest absolute balance in the group. */
  scale: number
  size?: keyof typeof SIZES
  className?: string
}) {
  const share = scale === 0 ? 0 : Math.abs(total) / scale
  const credit = total >= 0

  return (
    <div
      aria-hidden
      className={cn(
        'relative rounded-full bg-foreground/8',
        SIZES[size].track,
        className,
      )}
    >
      <span
        className={cn(
          'absolute left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-foreground/25',
          SIZES[size].axis,
        )}
      />
      <span
        className={cn(
          'absolute inset-y-0',
          credit
            ? 'left-1/2 rounded-r-full bg-credit'
            : 'right-1/2 rounded-l-full bg-debit',
        )}
        style={{ width: `${(share * 50).toFixed(2)}%` }}
      />
    </div>
  )
}
