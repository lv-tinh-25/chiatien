export const localeLabels = {
  vi: 'Tiếng Việt',
  'en-US': 'English',
} as const

export type Locale = keyof typeof localeLabels
export type Locales = ReadonlyArray<Locale>

export const locales: Locale[] = Object.keys(localeLabels) as Locale[]
export const defaultLocale: Locale = 'en-US'

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

/** Narrows what `useLocale()` returns, which next-intl types as a plain string. */
export function asLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale
}
