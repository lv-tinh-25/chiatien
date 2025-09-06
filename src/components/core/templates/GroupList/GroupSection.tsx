import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function GroupSection({
  title,
  icon,
  className,
  children,
}: {
  title: string
  icon?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn('flex flex-col gap-2.5', className)}>
      <h2 className="flex items-center gap-1.5 px-1 text-body-md font-bold text-muted-foreground">
        {icon}
        {title}
      </h2>
      <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fill,minmax(14.375rem,1fr))] lg:gap-3.5">
        {children}
      </div>
    </section>
  )
}
