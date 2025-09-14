'use client'

import { cn } from '@/lib/utils'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer size-6 shrink-0 cursor-pointer rounded-lg ring-2 ring-border ring-inset',
        'glass-flush transition-[background-color,box-shadow] duration-150 ease-out-soft',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:ring-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
