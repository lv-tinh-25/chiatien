'use client'

import { asLocale, localeLabels, locales, type Locale } from '@/i18n/locales'
import { setUserLocale } from '@/lib/locale'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type LanguageToggle = {
  /** The locale a press would move to. */
  target: Locale
  /** That locale's own name for itself, which is never translated. */
  targetLabel: string
  pending: boolean
  switchLanguage: () => void
}

/**
 * With two locales the choice is a press, not a menu. The next one is whichever
 * is not current, so adding a third locale turns this into a wrap-around and is
 * the moment to go back to a list.
 *
 * The locale lives in a cookie the server reads, so nothing on screen changes
 * until the route re-renders — hence the pending flag, and hence no toast: the
 * whole interface answering in another language is the confirmation.
 */
export function useLanguageToggle(): LanguageToggle {
  const current = asLocale(useLocale())
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()
  const [isSaving, setIsSaving] = useState(false)

  const target = locales.find((locale) => locale !== current) ?? current

  return {
    target,
    targetLabel: localeLabels[target],
    pending: isSaving || isRefreshing,
    switchLanguage: () => {
      if (isSaving || isRefreshing) return
      setIsSaving(true)
      void setUserLocale(target)
        .then(() => startRefresh(() => router.refresh()))
        .finally(() => setIsSaving(false))
    },
  }
}
