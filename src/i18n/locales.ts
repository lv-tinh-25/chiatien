export const localeLabels = {
  vi: 'Tiếng Việt',
  'en-US': 'English',
} as const

export type Locale = keyof typeof localeLabels
export type Locales = ReadonlyArray<Locale>

export const locales: Locale[] = Object.keys(localeLabels) as Locale[]

/**
 * The locale every message is guaranteed to exist in, and therefore the one
 * every other locale is merged on top of. It is not what a first-time visitor
 * sees; that is `displayLocale`.
 */
export const defaultLocale: Locale = 'en-US'

/**
 * Shown when the browser expresses no preference this app can honour. ChiaTien
 * is Vietnamese-first, so an unrecognised Accept-Language lands on Vietnamese
 * rather than on the merge base.
 */
export const displayLocale: Locale = 'vi'

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

/** Narrows what `useLocale()` returns, which next-intl types as a plain string. */
export function asLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale
}
