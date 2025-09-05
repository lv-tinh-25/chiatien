import type { ReactNode } from 'react'

export function GroupSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-3 text-label-sm tracking-wider text-muted-foreground uppercase">
        {title}
        <span aria-hidden className="h-px flex-1 bg-border" />
      </h2>
      <div className="stagger-children grid gap-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  )
}
