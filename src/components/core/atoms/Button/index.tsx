'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold',
    'transition-[background-color,box-shadow,transform,color] duration-150 ease-out-soft',
    'active:scale-[0.97] active:duration-75',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-action hover:bg-primary-active hover:shadow-raised',
        secondary:
          'bg-secondary text-secondary-foreground shadow-card hover:bg-secondary/90',
        outline:
          'glass-flush text-foreground ring-1 ring-border/70 ring-inset hover:bg-card',
        ghost: 'text-foreground hover:glass-flush',
        // The design fills this one: settling is the action the balances
        // screen exists to offer, so it is not a quiet secondary.
        settle:
          'bg-primary text-primary-foreground ring-1 ring-primary ring-inset hover:bg-primary-active',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        // Every size clears the 48px minimum touch target.
        sm: 'min-h-touch-min px-3.5 text-body-md',
        md: 'min-h-touch-min px-5 text-body-lg',
        lg: 'min-h-14 px-7 text-body-lg',
        icon: 'min-h-touch-min w-touch-min',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; pending?: boolean }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      asChild = false,
      pending = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) {
    // `aria-disabled` rather than `disabled`: a button that goes natively
    // disabled under the pointer loses focus, and inside a Radix dialog that
    // reads as the focus leaving the layer, which closes it. The click guard is
    // what actually stops the second press.
    if (asChild) {
      const Slotted = Slot
      return (
        <Slotted
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          onClick={onClick}
          {...props}
        >
          {children}
        </Slotted>
      )
    }

    return (
      <button
        ref={ref}
        aria-disabled={pending || undefined}
        aria-busy={pending || undefined}
        className={cn(
          buttonVariants({ variant, size }),
          pending && 'pointer-events-none opacity-70',
          className,
        )}
        onClick={(event) => {
          if (pending) {
            event.preventDefault()
            return
          }
          onClick?.(event)
        }}
        {...props}
      >
        {pending && <Loader2 aria-hidden className="animate-spin" />}
        {children}
      </button>
    )
  },
)

export { buttonVariants }
