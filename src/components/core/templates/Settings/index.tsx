'use client'

import { Card } from '@/components/core/atoms/Card'
import { asLocale, localeLabels, locales } from '@/i18n/locales'
import { setUserLocale } from '@/lib/locale'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

const FLAGS: Record<string, string> = { vi: '🇻🇳', 'en-US': '🇬🇧' }

export function Settings() {
  const t = useTranslations('Settings')
  const tNav = useTranslations('Nav')
  const locale = asLocale(useLocale())
  const router = useRouter()

  return (
    <div className="flex max-w-160 flex-col gap-4">
      <h1 className="hidden text-headline-lg font-extrabold text-foreground lg:block">
        {t('title')}
      </h1>

      <Card className="flex flex-col gap-2.5 p-4 lg:p-5">
        <span className="text-label-md font-bold text-muted-foreground">
          {tNav('settings')}
        </span>
        <div
          role="radiogroup"
          aria-label={tNav('settings')}
          className="grid gap-2.5 sm:grid-cols-2"
        >
          {locales.map((candidate) => {
            const selected = candidate === locale
            return (
              <button
                key={candidate}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  void setUserLocale(candidate).then(() => router.refresh())
                }
                className={cn(
                  'flex min-h-touch-min cursor-pointer items-center gap-2.5 rounded-control border px-3.5 py-3',
                  'transition-colors duration-150 ease-out-soft',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  selected
                    ? 'border-chip-selected-border bg-chip-selected'
                    : 'border-chip-border bg-chip/70 hover:bg-chip',
                )}
              >
                <span aria-hidden className="text-lg">
                  {FLAGS[candidate]}
                </span>
                <span className="flex-1 text-left text-body-lg font-bold text-foreground">
                  {localeLabels[candidate]}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'size-5 rounded-full border-2',
                    selected
                      ? 'border-primary bg-primary'
                      : 'border-border bg-transparent',
                  )}
                />
              </button>
            )
          })}
        </div>
      </Card>

      <Card tier="flush" className="p-4 text-body-sm text-muted-foreground">
        {t('about')}
      </Card>
    </div>
  )
}
