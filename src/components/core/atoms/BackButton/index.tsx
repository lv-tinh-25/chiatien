import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * The one way up, on both bars. It goes to the screen's parent rather than the
 * one visited last: the five group destinations are siblings, and stepping
 * back through history walks sideways between them instead of leaving.
 *
 * It replaces rather than pushes, so hopping between tabs and stepping up does
 * not grow the history without bound.
 */
export function BackButton({
  href,
  tone = 'raised',
  className,
}: {
  href: string
  /** `raised` sits beside a desktop title; `bar` sits inside the mobile header. */
  tone?: 'raised' | 'bar'
  className?: string
}) {
  const t = useTranslations('Nav')

  return (
    <Link
      href={href}
      replace
      aria-label={t('back')}
      className={cn(
        'flex shrink-0 cursor-pointer items-center justify-center rounded-control text-foreground',
        'transition-colors duration-150 ease-out-soft active:scale-[0.97]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        tone === 'raised'
          ? 'glass-flush size-9.5 hover:bg-card'
          : 'size-touch-min hover:glass-flush',
        className,
      )}
    >
      <ChevronLeft aria-hidden className="size-5" />
    </Link>
  )
}
