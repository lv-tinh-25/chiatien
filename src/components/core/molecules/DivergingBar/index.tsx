import { cn } from '@/lib/utils'

const SIZES = {
  sm: { bar: 'h-2', axis: 'h-3.5' },
  md: { bar: 'h-3 lg:h-3.5', axis: 'h-4.5 lg:h-5.5' },
}

/**
 * Diverges from a centre axis rather than filling from the left, so being owed
 * and owing are told apart by direction as well as by colour — the only
 * encoding a red/green-blind viewer can still read.
 *
 * There is no track behind the fill: the design leaves the empty half of the
 * axis blank, which is what keeps a row of these reading as a distribution
 * rather than a row of progress bars.
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
  const width = `${(scale === 0 ? 0 : (Math.abs(total) / scale) * 100).toFixed(2)}%`
  const credit = total >= 0

  return (
    <div aria-hidden className={cn('flex items-center', className)}>
      <div className="flex flex-1 justify-end">
        {!credit && (
          <div
            className={cn(
              'rounded-l-full rounded-r-sm bg-gradient-to-l from-debit to-debit/80',
              SIZES[size].bar,
            )}
            style={{ width }}
          />
        )}
      </div>
      <div
        className={cn('mx-px w-0.5 rounded-full bg-border', SIZES[size].axis)}
      />
      <div className="flex-1">
        {credit && (
          <div
            className={cn(
              'rounded-l-sm rounded-r-full bg-gradient-to-r from-credit/80 to-credit',
              SIZES[size].bar,
            )}
            style={{ width }}
          />
        )}
      </div>
    </div>
  )
}
