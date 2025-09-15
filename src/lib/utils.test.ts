import { Currency } from './currency'
import { cn, formatCurrency } from './utils'

describe('formatCurrency', () => {
  const currency: Currency = {
    name: 'Test',
    symbol_native: '',
    symbol: 'CUR',
    code: '',
    name_plural: '',
    rounding: 0,
    decimal_digits: 2,
  }
  /** For testing decimals */
  const partialAmount = 1.23
  /** For testing small full amounts */
  const smallAmount = 1
  /** For testing large full amounts */
  const largeAmount = 10000

  /** Non-breaking space */
  const nbsp = '\xa0'

  interface variation {
    amount: number
    locale: string
    result: string
  }

  /**
   * Variations to be tested, chosen as follows
   * - `en-US` is a very common i18n fallback
   * - `de-DE` exhibited faulty behavior in previous versions
   */
  const variations: variation[] = [
    {
      amount: partialAmount,
      locale: `en-US`,
      result: `${currency.symbol}1.23`,
    },
    {
      amount: smallAmount,
      locale: `en-US`,
      result: `${currency.symbol}1.00`,
    },
    {
      amount: largeAmount,
      locale: `en-US`,
      result: `${currency.symbol}10,000.00`,
    },
    {
      amount: partialAmount,
      locale: `de-DE`,
      result: `1,23${nbsp}${currency.symbol}`,
    },
    {
      amount: smallAmount,
      locale: `de-DE`,
      result: `1,00${nbsp}${currency.symbol}`,
    },
    {
      amount: largeAmount,
      locale: `de-DE`,
      result: `10.000,00${nbsp}${currency.symbol}`,
    },
  ]

  for (const variation of variations) {
    it(`formats ${variation.amount} in ${variation.locale} without fractions`, () => {
      expect(
        formatCurrency(currency, variation.amount * 100, variation.locale),
      ).toBe(variation.result)
    })
    it(`formats ${variation.amount} in ${variation.locale} with fractions`, () => {
      expect(
        formatCurrency(currency, variation.amount, variation.locale, true),
      ).toBe(variation.result)
    })
  }
})

describe('cn', () => {
  // Both scales were invisible to tailwind-merge, so a later class did not
  // replace an earlier one and the browser fell back to source order.
  it('lets a later font size replace an earlier one', () => {
    expect(cn('text-headline-sm', 'text-body-md')).toBe('text-body-md')
  })

  it('keeps a font size beside a colour', () => {
    expect(cn('text-headline-sm text-foreground')).toBe(
      'text-headline-sm text-foreground',
    )
  })

  it('lets a later size replace a touch-min width', () => {
    expect(cn('min-h-touch-min w-touch-min', 'size-7 min-h-0')).toBe(
      'size-7 min-h-0',
    )
  })
})
