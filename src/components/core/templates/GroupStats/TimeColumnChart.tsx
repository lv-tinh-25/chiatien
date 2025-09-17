'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type TimeColumn = {
  key: string
  label: string
  value: ReactNode
  /** 0 to 1. */
  fill: number
  /** The most recent column, which the design fills with the gradient. */
  current: boolean
  selectLabel: string
}

/**
 * Columns rather than rows: the design reads spending over time left to right,
 * and a horizontal bar per month reads as a ranking instead of a trend.
 *
 * The height is an inline style because it is data, not a design decision.
 */
export function TimeColumnChart({
  columns,
  renderTrigger,
}: {
  columns: TimeColumn[]
  /** Wraps each column so a drill-down dialog can own the click. */
  renderTrigger: (column: TimeColumn, trigger: ReactNode) => ReactNode
}) {
  // A group running for years produces more columns than fit, and a column
  // narrower than a thumb is not a target — so past that point the chart
  // scrolls instead of shrinking.
  return (
    <ul className="flex h-19.5 items-end gap-2 overflow-x-auto pb-1 lg:h-30 lg:gap-3.5">
      {columns.map((column) => (
        <li
          key={column.key}
          className="flex h-full min-w-8 max-w-16 flex-1 md:min-w-10 md:max-w-20"
        >
          {renderTrigger(
            column,
            <button
              type="button"
              aria-label={column.selectLabel}
              className="flex h-full w-full cursor-pointer flex-col items-center gap-1.5"
            >
              <span className="hidden max-w-full truncate text-label-sm text-muted-foreground md:block">
                {column.value}
              </span>
              {/* The bar is positioned against this track rather than sized as
                  a percentage of the column: a percentage height needs a
                  definite containing block, and without one a full bar grows
                  past the labels instead of meeting the top of the track. */}
              <span className="relative w-full flex-1">
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 rounded-t-lg rounded-b-sm transition-[height] duration-500 ease-out-soft',
                    column.current
                      ? 'bg-gradient-to-b from-primary/85 to-primary'
                      : 'bg-primary/25',
                  )}
                  style={{
                    height: `${Math.round(Math.max(0.04, Math.min(1, column.fill)) * 100)}%`,
                  }}
                />
              </span>
              <span className="max-w-full truncate text-label-sm text-muted-foreground">
                {column.label}
              </span>
            </button>,
          )}
        </li>
      ))}
    </ul>
  )
}
