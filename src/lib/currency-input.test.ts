import { enforceCurrencyPattern } from '@/lib/currency-input'

describe('enforceCurrencyPattern', () => {
  it('keeps a plain decimal unchanged', () => {
    expect(enforceCurrencyPattern('123.45')).toBe('123.45')
  })

  it('preserves a leading minus for income', () => {
    expect(enforceCurrencyPattern('-50')).toBe('-50')
  })

  it('drops a minus that is not leading', () => {
    expect(enforceCurrencyPattern('12-34')).toBe('1234')
  })

  it('promotes the first comma to a decimal point', () => {
    expect(enforceCurrencyPattern('1,5')).toBe('1.5')
  })

  it('removes separators after the first one', () => {
    expect(enforceCurrencyPattern('1,234,567')).toBe('1.234567')
  })

  it('strips letters and currency symbols', () => {
    expect(enforceCurrencyPattern('1000đ')).toBe('1000')
  })

  it('returns an empty string when nothing numeric remains', () => {
    expect(enforceCurrencyPattern('abc')).toBe('')
  })
})
