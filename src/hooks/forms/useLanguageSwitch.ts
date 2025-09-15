'use client'

import { asLocale, localeLabels, locales, type Locale } from '@/i18n/locales'
import { setUserLocale } from '@/lib/locale'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'

type LanguageOption = {
  locale: Locale
  /** The language's own name for itself, which is never translated. */
  label: string
  selected: boolean
}

type LanguageSwitch = {
  options: LanguageOption[]
  /** Where the marker belongs, so the caller does not re-derive it. */
  selectedIndex: number
  /** What is being read now, and what one press would give instead. */
  shown: Locale
  target: LanguageOption
  pending: boolean
  select: (locale: Locale) => void
}

/**
 * Both languages are offered at once rather than one button that guesses the
 * next: a single flag never says whether it names what you are reading or what
 * you would get, and with the choice laid out the selected state answers that
 * without a word.
 *
 * Selection moves on the press, not on the response. Writing the cookie and
 * re-rendering the server components takes a couple of hundred milliseconds,
 * and a control that sits still for that long reads as broken — so the choice
 * is shown optimistically and React reconciles it when the route catches up.
 *
 * No toast either way: the whole interface answering in another language is
 * the confirmation.
 */
export function useLanguageSwitch(): LanguageSwitch {
  const current = asLocale(useLocale())
  const router = useRouter()
  const [pending, startSwitching] = useTransition()
  const [shown, showImmediately] = useOptimistic(current)

  const options = locales.map((locale) => ({
    locale,
    label: localeLabels[locale],
    selected: locale === shown,
  }))

  return {
    options,
    selectedIndex: locales.indexOf(shown),
    shown,
    // With two locales the next one is simply the other; a third would make
    // this a wrap-around, which is the moment to go back to a list.
    target: options.find((option) => !option.selected) ?? options[0],
    pending,
    select: (locale) => {
      // Deliberately not blocked while one is in flight: a press that lands
      // during the wait re-aims the marker and wins, rather than being dropped
      // by the control the user is pressing precisely because it looks slow.
      if (locale === shown) return
      startSwitching(async () => {
        showImmediately(locale)
        await setUserLocale(locale)
        router.refresh()
      })
    },
  }
}
