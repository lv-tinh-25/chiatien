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
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="glass-modal z-50 max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-control"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex min-h-touch-min cursor-default items-center justify-between rounded-control px-3 text-body-lg text-foreground outline-none data-[highlighted]:bg-foreground/6"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
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
