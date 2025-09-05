import type { ReactNode } from 'react'

export function GroupSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-headline-md text-foreground">{title}</h2>
      {children}
    </section>
  )
}
