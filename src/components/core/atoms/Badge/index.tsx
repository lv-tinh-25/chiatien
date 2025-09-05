import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-label-sm',
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-muted-foreground',
        credit: 'bg-credit-subtle text-credit',
        debit: 'bg-debit-subtle text-debit',
        pending: 'bg-accent/15 text-accent-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
