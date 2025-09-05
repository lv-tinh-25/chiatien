export const localeLabels = {
  vi: 'Tiếng Việt',
  'en-US': 'English',
} as const

export type Locale = keyof typeof localeLabels
export type Locales = ReadonlyArray<Locale>

export const locales: Locale[] = Object.keys(localeLabels) as Locale[]
export const defaultLocale: Locale = 'en-US'
