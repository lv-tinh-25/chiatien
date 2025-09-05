import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

/**
 * The inset ring, not the glass border, is what gives a field its edge: the
 * glass border is near-white by design and would leave the control shapeless.
 */
export const inputSurface = cn(
  'glass-flush rounded-control text-body-lg text-foreground ring-1 ring-border/70 ring-inset',
  'transition-[box-shadow,background-color] duration-150 ease-out-soft',
  'placeholder:text-muted-foreground',
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        inputSurface,
        'flex min-h-touch-min w-full px-3.5',
        '[&::-webkit-search-cancel-button]:appearance-none',
        className,
      )}
      {...props}
    />
  )
})
