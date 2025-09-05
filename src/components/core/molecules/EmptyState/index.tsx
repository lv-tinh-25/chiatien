import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-card border border-dashed border-border/80 bg-card/40 px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-headline-sm text-foreground">{title}</p>
      {description && (
        <p className="text-body-md text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  )
}
