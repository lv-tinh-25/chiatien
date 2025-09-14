'use client'

import { Flag } from '@/components/core/atoms/Flag'
import { useLanguageSwitch } from '@/hooks/forms/useLanguageSwitch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/**
 * One marker that slides rather than two backgrounds that swap: the movement is
 * what tells the eye the choice was received, and a transform re-aims itself
 * mid-flight, so pressing back and forth quickly leaves the marker wherever the
 * last press put it without any of it depending on the transition finishing.
 *
 * Nothing dims while the switch is in flight. The wait is too short for a
 * loading state to be anything but a flash, and the marker has already moved.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations('Nav')
  const { options, selectedIndex, pending, select } = useLanguageSwitch()

  return (
    <div
      role="radiogroup"
      aria-label={t('language')}
      aria-busy={pending || undefined}
      className={cn(
        'relative flex items-center gap-0.5 rounded-full bg-muted/70 p-0.5',
        'aria-busy:settling',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 left-0.5 size-9 rounded-full bg-card shadow-segment lg:size-8',
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
            'relative flex size-9 cursor-pointer items-center justify-center rounded-full lg:size-8',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            'active:scale-95 active:duration-75',
            'transition-transform duration-150 ease-out-soft',
          )}
        >
          <Flag
            locale={locale}
            className={cn(
              'size-5 transition-[filter,opacity] duration-200 ease-out-soft lg:size-4.5',
              selected ? 'ring-1 ring-border/60' : 'opacity-55 grayscale',
            )}
          />
        </button>
      ))}
    </div>
  )
}
