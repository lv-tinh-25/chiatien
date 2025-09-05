import type { ReactNode } from 'react'

/**
 * Wide screens get a second column instead of a wider first one: past roughly
 * 70 characters a list of expense titles stops being easier to scan and starts
 * being harder. The aside is `xl` and up only, and is supplementary — every
 * figure in it has its own destination in the navigation.
 */
export function GroupScreen({
  aside,
  children,
}: {
  aside: ReactNode
  children: ReactNode
}) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0">{children}</div>
      <aside className="hidden xl:sticky xl:top-24 xl:block">{aside}</aside>
    </div>
  )
}
