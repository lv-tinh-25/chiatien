'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
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
        settle:
          'bg-credit-subtle text-credit ring-1 ring-credit/25 ring-inset hover:bg-credit/15',
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
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, asChild = false, ...props },
    ref,
  ) {
    const Component = asChild ? Slot : 'button'
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)

export { buttonVariants }
