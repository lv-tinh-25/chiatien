'use client'

import { Flag } from '@/components/core/atoms/Flag'
import { useLanguageSwitch } from '@/hooks/forms/useLanguageSwitch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/**
 * Selection is carried by a ring and a lifted surface as well as by colour: the
 * unselected flag is drained rather than merely dimmed, so the difference
 * survives both a greyscale screenshot and a viewer who cannot separate the
 * two palettes.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations('Nav')
  const { options, pending, select } = useLanguageSwitch()

  return (
    <div
      role="radiogroup"
      aria-label={t('language')}
      aria-busy={pending || undefined}
      className={cn(
        'flex items-center gap-0.5 rounded-full bg-muted/70 p-0.5',
        pending && 'pointer-events-none opacity-60',
        className,
      )}
    >
      {options.map(({ locale, label, selected }) => (
        <button
          key={locale}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={label}
          onClick={() => select(locale)}
          className={cn(
            'flex size-9 cursor-pointer items-center justify-center rounded-full lg:size-8',
            'transition-[background-color,box-shadow,transform] duration-150 ease-out-soft',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            selected
              ? 'bg-card shadow-segment'
              : 'hover:bg-card/60 active:scale-95',
          )}
        >
          <Flag
            locale={locale}
            className={cn(
              'size-5 transition-[filter,opacity] duration-150 ease-out-soft lg:size-4.5',
              selected ? 'ring-1 ring-border/60' : 'opacity-55 grayscale',
            )}
          />
        </button>
      ))}
    </div>
  )
}
