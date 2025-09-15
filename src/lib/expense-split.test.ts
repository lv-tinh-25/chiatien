import type { Currency } from '@/lib/currency'
import { redistributeShares, seedSharesForMode } from '@/lib/expense-split'

const USD: Currency = {
  name: 'US dollar',
  symbol_native: '$',
  symbol: '$',
  code: 'USD',
  name_plural: 'US dollars',
  rounding: 0,
  decimal_digits: 2,
}

const rows = (...participants: string[]) =>
  participants.map((participant) => ({ participant, shares: '0' }))

describe('redistributeShares', () => {
  it('leaves every mode but BY_AMOUNT alone', () => {
    const paidFor = rows('a', 'b')
    expect(redistributeShares('EVENLY', paidFor, 90, new Set(), USD)).toBe(
      paidFor,
    )
    expect(redistributeShares('BY_SHARES', paidFor, 90, new Set(), USD)).toBe(
      paidFor,
    )
  })

  it('splits the amount evenly when nothing was edited by hand', () => {
    const result = redistributeShares(
      'BY_AMOUNT',
      rows('a', 'b'),
      90,
      new Set(),
      USD,
    )
    expect(result.map((row) => row.shares)).toEqual(['45.00', '45.00'])
  })

  it('apportions the remainder rather than rounding each share', () => {
    // 95 over three would be 31.666… each; rounding each independently gives
    // 95.01, which the schema then rejects.
    const result = redistributeShares(
      'BY_AMOUNT',
      rows('a', 'b', 'c'),
      95,
      new Set(),
      USD,
    )
    const total = result.reduce((sum, row) => sum + Number(row.shares), 0)
    expect(Number(total.toFixed(2))).toBe(95)
  })

  it('leaves a hand-edited share untouched and splits what remains', () => {
    const paidFor = [
      { participant: 'a', shares: '60' },
      { participant: 'b', shares: '0' },
      { participant: 'c', shares: '0' },
    ]
    const result = redistributeShares(
      'BY_AMOUNT',
      paidFor,
      100,
      new Set(['a']),
      USD,
    )
    expect(result[0].shares).toBe('60')
    expect(result[1].shares).toBe('20.00')
    expect(result[2].shares).toBe('20.00')
  })

  it('changes nothing when every participant was edited by hand', () => {
    const paidFor = [
      { participant: 'a', shares: '30' },
      { participant: 'b', shares: '70' },
    ]
    const result = redistributeShares(
      'BY_AMOUNT',
      paidFor,
      100,
      new Set(['a', 'b']),
      USD,
    )
    expect(result.map((row) => row.shares)).toEqual(['30', '70'])
  })

  it('handles a zero-decimal currency without inventing cents', () => {
    const VND: Currency = { ...USD, code: 'VND', decimal_digits: 0 }
    const result = redistributeShares(
      'BY_AMOUNT',
      rows('a', 'b'),
      90001,
      new Set(),
      VND,
    )
    expect(result.map((row) => row.shares)).toEqual(['45001', '45000'])
  })

  it('returns zero shares for an empty amount', () => {
    const result = redistributeShares(
      'BY_AMOUNT',
      rows('a', 'b'),
      0,
      new Set(),
      USD,
    )
    expect(result.map((row) => row.shares)).toEqual(['0.00', '0.00'])
  })
})

describe('seedSharesForMode', () => {
  it('gives everyone one share', () => {
    const result = seedSharesForMode('BY_SHARES', rows('a', 'b', 'c'))
    expect(result.map((row) => row.shares)).toEqual(['1', '1', '1'])
  })

  it('spreads percentages so they add up to exactly 100', () => {
    const result = seedSharesForMode('BY_PERCENTAGE', rows('a', 'b', 'c'))
    expect(result.map((row) => row.shares)).toEqual(['34', '33', '33'])
    expect(result.reduce((sum, row) => sum + Number(row.shares), 0)).toBe(100)
  })

  it('leaves the modes that derive their own shares alone', () => {
    const paidFor = rows('a', 'b')
    expect(seedSharesForMode('EVENLY', paidFor)).toBe(paidFor)
    expect(seedSharesForMode('BY_AMOUNT', paidFor)).toBe(paidFor)
  })

  it('has nothing to seed when nobody is paid for', () => {
    const paidFor = rows()
    expect(seedSharesForMode('BY_SHARES', paidFor)).toBe(paidFor)
  })
})
