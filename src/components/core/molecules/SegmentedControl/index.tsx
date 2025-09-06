'use client'

import { cn } from '@/lib/utils'
import * as RadioGroup from '@radix-ui/react-radio-group'

export type SegmentedOption = {
  value: string
  label: string
  /** Shown instead of `label` where the track is narrow. */
  shortLabel?: string
  /** The accessible name, when the visible label is an abbreviation. */
  ariaLabel?: string
}

/**
 * An always-visible row of choices on an inset track, as the design draws split
 * modes and stat ranges. Built on a Radix RadioGroup so arrow keys work and
 * each option keeps an accessible name a test can select by.
 */
export function SegmentedControl({
  value,
  options,
  onValueChange,
  testId,
  ariaLabel,
  className,
}: {
  value: string
  options: SegmentedOption[]
  onValueChange: (value: string) => void
  testId?: string
  ariaLabel: string
  className?: string
}) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      data-testid={testId}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex gap-0.5 rounded-control bg-foreground/6 p-0.75',
        className,
      )}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          aria-label={option.ariaLabel ?? option.label}
          className={cn(
            'cursor-pointer rounded-[0.5625rem] px-2.5 py-1.5 text-body-sm font-bold whitespace-nowrap',
            'transition-colors duration-150 ease-out-soft',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            'data-[state=checked]:bg-card data-[state=checked]:text-primary-ink data-[state=checked]:shadow-segment',
            'data-[state=unchecked]:text-muted-foreground data-[state=unchecked]:hover:text-foreground',
          )}
        >
          <span className="sm:hidden">{option.shortLabel ?? option.label}</span>
          <span className="hidden sm:inline">{option.label}</span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}
