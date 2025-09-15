'use client'

import { Flag } from '@/components/core/atoms/Flag'
import { useLanguageSwitch } from '@/hooks/forms/useLanguageSwitch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/**
 * Two shapes, for the two amounts of room. A desktop header has space to lay
 * the choice out, and laid out it needs no explaining: the marked one is the
 * language being read. A phone header does not — the pair costs 78px beside a
 * title already being truncated — so there it is one flag, the one in use, and
 * a press swaps it. The swap is what makes that unambiguous: whatever a lone
 * flag might have meant before the press, after it the flag has changed.
 *
 * The marker slides rather than two backgrounds swapping, and a transform
 * re-aims itself mid-flight, so pressing back and forth leaves it wherever the
 * last press put it without any of it depending on the transition finishing.
 */
export function LanguageSwitch({
  variant,
  className,
}: {
  variant: 'pair' | 'single'
  className?: string
}) {
  const t = useTranslations('Nav')
  const { options, selectedIndex, shown, target, pending, select } =
    useLanguageSwitch()

  if (variant === 'single') {
    return (
      <button
        type="button"
        aria-label={t('switchLanguage', { language: target.label })}
        aria-busy={pending || undefined}
        onClick={() => select(target.locale)}
        className={cn(
          'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted/70',
          'transition-transform duration-150 ease-out-soft active:scale-95 active:duration-75',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          'aria-busy:settling',
          className,
        )}
      >
        <Flag locale={shown} className="size-6 ring-1 ring-border/60" />
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('language')}
      aria-busy={pending || undefined}
      className={cn(
        'relative flex h-9 shrink-0 items-center gap-0.5 rounded-full bg-muted/70 p-0.5',
        'aria-busy:settling',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 left-0.5 size-8 rounded-full bg-card shadow-segment',
          'transition-transform duration-200 ease-out-soft',
          selectedIndex === 1 && 'translate-x-[calc(100%+0.125rem)]',
        )}
      />

      {options.map(({ locale, label, selected }) => (
        <button
          key={locale}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={label}
          onClick={() => select(locale)}
          className={cn(
            'relative flex size-8 cursor-pointer items-center justify-center rounded-full',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            'transition-transform duration-150 ease-out-soft active:scale-95 active:duration-75',
          )}
        >
          <Flag
            locale={locale}
            className={cn(
              'size-4.5 transition-[filter,opacity] duration-200 ease-out-soft',
              selected ? 'ring-1 ring-border/60' : 'opacity-55 grayscale',
            )}
          />
        </button>
      ))}
    </div>
  )
}
