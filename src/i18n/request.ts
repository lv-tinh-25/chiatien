import { defaultLocale, isLocale, type Locale } from '@/i18n/locales'
import { getUserLocale } from '@/lib/locale'
import deepmerge from 'deepmerge'
import { getRequestConfig } from 'next-intl/server'

const NAMESPACES = [
  'common',
  'groups',
  'expenses',
  'balances',
  'stats',
  'errors',
] as const

async function load(locale: Locale) {
  const namespaces = await Promise.all(
    NAMESPACES.map(
      async (namespace) =>
        (await import(`../../messages/${locale}/${namespace}.json`)).default,
    ),
  )
  return Object.assign({}, ...namespaces)
}

export default getRequestConfig(async () => {
  const requested = await getUserLocale()
  const locale = isLocale(requested) ? requested : defaultLocale

  // English is merged underneath every other locale so a key that has not been
  // translated yet renders in English instead of throwing. The messages test is
  // what stops that fallback from hiding a permanent gap.
  const messages =
    locale === defaultLocale
      ? await load(defaultLocale)
      : deepmerge(await load(defaultLocale), await load(locale))

  return { locale, messages }
})
