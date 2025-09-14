'use client'

import { asLocale, localeLabels, locales, type Locale } from '@/i18n/locales'
import { setUserLocale } from '@/lib/locale'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type LanguageOption = {
  locale: Locale
  /** The language's own name for itself, which is never translated. */
  label: string
  selected: boolean
}

type LanguageSwitch = {
  options: LanguageOption[]
  pending: boolean
  select: (locale: Locale) => void
}

/**
 * Both languages are offered at once rather than one button that guesses the
 * next: a single flag never says whether it names what you are reading or what
 * you would get, and with the choice laid out the selected state answers that
 * without a word.
 *
 * The locale lives in a cookie the server reads, so nothing changes on screen
 * until the route re-renders — hence the pending flag, and hence no toast: the
 * whole interface answering in another language is the confirmation.
 */
export function useLanguageSwitch(): LanguageSwitch {
  const current = asLocale(useLocale())
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()
  const [isSaving, setIsSaving] = useState(false)

  const pending = isSaving || isRefreshing

  return {
    options: locales.map((locale) => ({
      locale,
      label: localeLabels[locale],
      selected: locale === current,
    })),
    pending,
    select: (locale) => {
      if (pending || locale === current) return
      setIsSaving(true)
      void setUserLocale(locale)
        .then(() => startRefresh(() => router.refresh()))
        .finally(() => setIsSaving(false))
    },
  }
}
