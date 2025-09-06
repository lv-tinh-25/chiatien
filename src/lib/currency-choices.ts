import type { Locale } from '@/i18n/locales'
import { getCurrency, type Currency } from './currency'

/**
 * The two currencies the design offers. Every other ISO code still renders
 * correctly wherever one is already stored — this list only bounds what the
 * pickers put on screen.
 */
export const CURRENCY_CHOICES = ['VND', 'USD'] as const

export type CurrencyChoice = (typeof CURRENCY_CHOICES)[number]

export function currencyChoices(locale: Locale): Currency[] {
  return CURRENCY_CHOICES.map((code) => getCurrency(code, locale))
}

/**
 * A stored code the pickers cannot offer — an older group, or one created
 * before the list narrowed — is shown alongside them rather than silently
 * swapped for one that is.
 */
export function currencyChoicesWith(
  locale: Locale,
  code: string | null | undefined,
): Currency[] {
  const choices = currencyChoices(locale)
  if (!code || choices.some((currency) => currency.code === code)) {
    return choices
  }
  return [...choices, getCurrency(code, locale)]
}
