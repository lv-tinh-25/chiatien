import type { Currency } from './currency'

/**
 * `₫ VND` — the symbol the design leads with, then the code that disambiguates
 * it. A custom currency carries no code, so it is shown on its own rather than
 * with a trailing separator.
 */
export function currencyLabel(currency: Currency): string {
  return currency.code === ''
    ? currency.symbol_native
    : `${currency.symbol_native} ${currency.code}`
}
