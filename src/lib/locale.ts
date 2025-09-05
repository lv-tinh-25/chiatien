'use server'

import { Locale, Locales, displayLocale, locales } from '@/i18n/locales'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { cookies, headers } from 'next/headers'

const COOKIE_NAME = 'NEXT_LOCALE'

function getAcceptLanguageLocale(requestHeaders: Headers, locales: Locales) {
  let locale
  const languages = new Negotiator({
    headers: {
      'accept-language': requestHeaders.get('accept-language') || undefined,
    },
  }).languages()
  try {
    locale = match(languages, locales, displayLocale)
  } catch (e) {
    locale = displayLocale
  }
  return locale
}

export async function getUserLocale() {
  let locale

  locale = (await cookies()).get(COOKIE_NAME)?.value

  if (!locale) {
    locale = getAcceptLanguageLocale(await headers(), locales)
  }

  return locale
}

export async function setUserLocale(locale: Locale) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
