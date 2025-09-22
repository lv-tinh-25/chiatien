'use client'

import type { Currency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

type CurrencyChipsProps = {
  id?: string
  value: string
  options: readonly Currency[]
  onValueChange: (code: string) => void
  label: string
  /** `inset` rides beside the amount input; `outline` fills a form row. */
  variant?: 'inset' | 'outline'
  disabled?: boolean
  'aria-describedby'?: string
}

/**
 * The design's currency control: a short row of chips rather than a searchable
 * list, because a group settles in one currency and picks it once.
 */
export function CurrencyChips({
  id,
  value,
  options,
  onValueChange,
  label,
  variant = 'inset',
  disabled = false,
  'aria-describedby': describedBy,
}: CurrencyChipsProps) {
  return (
    <RadioGroupPrimitive.Root
      id={id}
      aria-label={label}
      aria-describedby={describedBy}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn(
        'flex gap-1',
        variant === 'inset' &&
          'shrink-0 rounded-control border border-input bg-card/70 p-1',
      )}
    >
      {options.map((currency) => (
        <RadioGroupPrimitive.Item
          key={currency.code}
          value={currency.code}
          title={currency.name}
          className={cn(
            'cursor-pointer font-bold transition-colors duration-150 ease-out-soft',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-60',
            variant === 'inset'
              ? cn(
                  'min-h-9.5 rounded-[0.5625rem] px-3 text-body-lg',
                  currency.code === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              : cn(
                  'min-h-touch-min flex-1 rounded-control border px-3 text-body-md',
                  currency.code === value
                    ? 'border-chip-selected-border bg-chip-selected text-chip-selected-foreground'
                    : 'border-chip-border bg-chip/80 text-chip-foreground hover:bg-chip',
                ),
          )}
        >
          {variant === 'inset'
            ? currency.symbol_native
            : `${currency.symbol_native} ${currency.code}`}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
}
