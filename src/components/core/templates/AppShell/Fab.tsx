import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export function Fab({
  href,
  label,
  aboveNav,
}: {
  href: string
  label: string
  aboveNav: boolean
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'action-gradient fixed right-4 z-31 flex size-14.5 items-center justify-center rounded-[1.1875rem]',
        'text-primary-foreground shadow-fab transition-transform duration-150 ease-out-soft active:scale-95 lg:hidden',
        aboveNav ? 'bottom-23' : 'bottom-6',
      )}
    >
      <Plus className="size-6.5" aria-hidden />
    </Link>
  )
}
