import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function GroupSection({
  title,
  icon,
  layout = 'cards',
  className,
  children,
}: {
  title: string
  icon?: ReactNode
  /** Archived groups are single lines, not tiles. */
  layout?: 'cards' | 'rows'
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn('flex flex-col gap-2.5', className)}>
      <h2 className="flex items-center gap-1.5 px-1 text-body-md font-bold text-muted-foreground">
        {icon}
        {title}
      </h2>
      <div
        className={cn(
          'stagger-children gap-3 lg:gap-3.5',
          layout === 'cards'
            ? 'grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(14.375rem,1fr))]'
            : 'flex flex-col gap-2',
        )}
      >
        {children}
      </div>
    </section>
  )
}
