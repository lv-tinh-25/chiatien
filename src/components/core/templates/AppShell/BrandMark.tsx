import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * The tile carries the app's initial rather than a logo file: one glyph in the
 * brand gradient reads at 26px and costs no request.
 */
export function BrandMark({ className }: { className?: string }) {
  const t = useTranslations('App')
  const name = t('name')

  return (
    <Link
      href="/groups"
      className={cn(
        'flex shrink-0 items-center gap-2.5 rounded-control px-2 py-1.5 transition-colors duration-150 ease-out-soft hover:bg-foreground/5',
        className,
      )}
    >
      <span
        aria-hidden
        className="action-gradient flex size-7 items-center justify-center rounded-[0.5625rem] text-body-md font-extrabold text-primary-foreground shadow-action"
      >
        {name.slice(0, 1)}
      </span>
      <span className="text-headline-md font-extrabold text-foreground">
        {name}
      </span>
    </Link>
  )
}
