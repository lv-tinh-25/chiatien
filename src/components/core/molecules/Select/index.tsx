'use client'

import { inputSurface } from '@/components/core/atoms/Input'
import { cn } from '@/lib/utils'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

export type SelectOption = { value: string; label: string }

type SelectProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  name?: string
  /** Stable hook for end-to-end tests that must target this trigger. */
  testId?: string
  'aria-describedby'?: string
  className?: string
}

export function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  name,
  testId,
  className,
  ...aria
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      name={name}
    >
      <SelectPrimitive.Trigger
        id={id}
        data-testid={testId}
        aria-describedby={aria['aria-describedby']}
        className={cn(
          inputSurface,
          'flex min-h-touch-min w-full cursor-pointer items-center justify-between gap-2 px-3.5',
          'data-[placeholder]:text-muted-foreground',
          className,
        )}
      >
        {/* Radix renders `Value` and `ItemText` as their own elements and drops
            the class handed to them, so the truncation has to live on a span we
            own. */}
        <span className="min-w-0 flex-1 truncate text-left">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon className="shrink-0">
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="solid-overlay z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] max-w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-control"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex min-h-touch-min cursor-default items-center justify-between gap-3 rounded-control px-3 text-body-lg text-foreground outline-none data-[highlighted]:bg-foreground/6"
              >
                <span className="min-w-0 flex-1 truncate">
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                </span>
                <SelectPrimitive.ItemIndicator>
                  <Check className="size-4 text-primary" aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
