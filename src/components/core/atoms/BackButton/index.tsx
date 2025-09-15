import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * The desktop shell has no back affordance, so every screen the design draws
 * one on gets it beside the title.
 *
 * It replaces rather than pushes: going back from a screen and then forward
 * again through the browser's own back button should not land on the screen
 * that was just left.
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
      replace
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
