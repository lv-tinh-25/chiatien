import { cn } from '@/lib/utils'

/**
 * A block standing in for content that has not arrived. It is shaped by the
 * caller: a skeleton that does not match what replaces it moves the page when
 * the data lands, which is worse than showing nothing.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-control bg-foreground/8', className)}
    />
  )
}
