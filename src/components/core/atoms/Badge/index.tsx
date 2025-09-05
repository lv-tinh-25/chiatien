import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex h-7 items-center gap-1 rounded-full px-3 text-label-sm ring-1 ring-inset',
  {
    variants: {
      tone: {
        neutral: 'bg-muted/70 text-muted-foreground ring-border/60',
        credit: 'bg-credit-subtle text-credit ring-credit/20',
        debit: 'bg-debit-subtle text-debit ring-debit/20',
        pending: 'bg-accent/15 text-accent-foreground ring-accent/30',
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
