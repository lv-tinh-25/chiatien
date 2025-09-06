import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

/**
 * Anchored to the 480px column rather than the viewport, so on a tablet running
 * the phone layout it stays beside the app instead of drifting to the far edge.
 */
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
        'action-gradient fixed left-1/2 z-31 flex size-14.5 items-center justify-center rounded-[1.1875rem]',
        'text-primary-foreground shadow-fab transition-transform duration-150 ease-out-soft active:scale-95 lg:hidden',
        'translate-x-[calc(min(100vw,480px)/2-4.625rem)]',
        aboveNav ? 'bottom-23' : 'bottom-6',
      )}
    >
      <Plus className="size-6.5" strokeWidth={2.4} aria-hidden />
    </Link>
  )
}
