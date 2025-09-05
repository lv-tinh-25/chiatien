/**
 * Regenerates src/lib/currency-data.json: localized currency names for every
 * supported locale. Locales and codes are read out of the source of truth
 * rather than duplicated here, so the three cannot drift.
 */
import currencyListModule from 'currency-list'
import { readFileSync, writeFileSync } from 'node:fs'

// `get` is a method that reads `this.currencyList`, so it has to stay bound.
const CurrencyList = currencyListModule.default ?? currencyListModule

const localesSource = readFileSync('src/i18n/locales.ts', 'utf8')
const locales = [
  ...localesSource.matchAll(/^\s+'?([a-z]{2}(?:-[A-Z]{2})?)'?:/gm),
].map((match) => match[1])

const currencySource = readFileSync('src/lib/currency.ts', 'utf8')
const block = currencySource.match(
  /supportedCurrencyCodes\s*=\s*\[([\s\S]*?)\]\s*as const/,
)
const codes = [...block[1].matchAll(/'([A-Z]{3})'/g)].map((match) => match[1])

const data = Object.fromEntries(
  locales.map((locale) => [
    locale,
    Object.fromEntries(
      codes.map((code) => {
        try {
          return [code, CurrencyList.get(code, locale.replaceAll('-', '_'))]
        } catch {
          return [code, CurrencyList.get(code, 'en_US')]
        }
      }),
    ),
  ]),
)

writeFileSync('src/lib/currency-data.json', JSON.stringify(data, null, 2) + '\n')
console.log(`locales: ${locales.join(', ')} | codes: ${codes.length}`)
