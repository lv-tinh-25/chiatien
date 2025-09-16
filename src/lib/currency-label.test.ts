import { currencyLabel } from './currency-label'

const dong = {
  code: 'VND',
  symbol_native: '₫',
  decimal_digits: 0,
  name: 'Vietnamese Dong',
  symbol: '₫',
  rounding: 0,
  name_plural: 'Vietnamese dong',
}

describe('currencyLabel', () => {
  it('leads with the native symbol and follows with the code', () => {
    expect(currencyLabel(dong)).toBe('₫ VND')
  })

  it('shows a custom currency on its own', () => {
    expect(currencyLabel({ ...dong, code: '', symbol_native: 'gold' })).toBe(
      'gold',
    )
  })
})
