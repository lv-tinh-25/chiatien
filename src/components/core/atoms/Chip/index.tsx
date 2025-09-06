'use client'

import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean
}

/**
 * The design's one selection control: categories, payers, currencies and
 * languages all wear it. `role` is left to the caller so a row of chips can be
 * a listbox, a radiogroup, or plain buttons as the surrounding markup needs.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-selected={props.role === 'option' ? selected : undefined}
      className={cn(
        'inline-flex min-h-9.5 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-body-sm font-bold',
        'transition-colors duration-150 ease-out-soft active:scale-[0.97]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        selected
          ? 'border-chip-selected-border bg-chip-selected text-chip-selected-foreground'
          : 'border-chip-border bg-chip/80 text-chip-foreground hover:bg-chip',
        className,
      )}
      {...props}
    />
  )
})
