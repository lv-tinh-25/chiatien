import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * The desktop shell has no back affordance, so every screen the design draws
 * one on gets it beside the title.
 */
export function BackButton({
  href,
  className,
}: {
  href: string
  className?: string
}) {
  const t = useTranslations('Nav')

  return (
    <Link
      href={href}
      aria-label={t('back')}
      className={cn(
        'glass-flush flex size-9.5 shrink-0 items-center justify-center rounded-control text-foreground',
        'transition-colors duration-150 ease-out-soft hover:bg-card',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className,
      )}
    >
      <ChevronLeft aria-hidden className="size-5" />
    </Link>
  )
}
