import { inputSurface } from '@/components/core/atoms/Input'
import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

/**
 * `display: flex` collapses a date field's shadow layout: the picker button
 * stops filling the field and lands right beside the digits instead of at the
 * far edge. So this is the one control in the project that stays `block`.
 */
export const DateInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
>(function DateInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="date"
      className={cn(
        inputSurface,
        'block min-h-touch-min w-full px-3.5 text-body-md font-semibold',
        className,
      )}
      {...props}
    />
  )
})
