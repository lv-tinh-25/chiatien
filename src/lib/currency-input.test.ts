import {
  amountSeparators,
  caretAfterFormat,
  enforceCurrencyPattern,
  formatAmountForInput,
  parseAmountInput,
  significantBeforeCaret,
} from '@/lib/currency-input'

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

describe('amountSeparators', () => {
  it('reads the Vietnamese marks', () => {
    expect(amountSeparators('vi')).toEqual({ group: '.', decimal: ',' })
  })

  it('reads the English marks', () => {
    expect(amountSeparators('en-US')).toEqual({ group: ',', decimal: '.' })
  })
})

const VI = { group: '.', decimal: ',' }
const EN = { group: ',', decimal: '.' }

describe('formatAmountForInput', () => {
  it('groups thousands the way the reader writes them', () => {
    expect(formatAmountForInput('120312', VI)).toBe('120.312')
    expect(formatAmountForInput('120312', EN)).toBe('120,312')
  })

  it('leaves a number too small to group alone', () => {
    expect(formatAmountForInput('312', VI)).toBe('312')
  })

  it('groups millions in threes', () => {
    expect(formatAmountForInput('72690000', VI)).toBe('72.690.000')
  })

  it('carries the fraction across on the reader’s mark', () => {
    expect(formatAmountForInput('1234.56', VI)).toBe('1.234,56')
    expect(formatAmountForInput('1234.56', EN)).toBe('1,234.56')
  })

  it('keeps a separator the user has only just typed', () => {
    expect(formatAmountForInput('1234.', VI)).toBe('1.234,')
  })

  it('keeps income negative', () => {
    expect(formatAmountForInput('-120312', VI)).toBe('-120.312')
    expect(formatAmountForInput('-', VI)).toBe('-')
  })

  it('has nothing to do with an empty field', () => {
    expect(formatAmountForInput('', VI)).toBe('')
  })
})

describe('parseAmountInput', () => {
  it('undoes its own formatting', () => {
    expect(parseAmountInput('120.312', VI)).toBe('120312')
    expect(parseAmountInput('1.234,56', VI)).toBe('1234.56')
    expect(parseAmountInput('1,234.56', EN)).toBe('1234.56')
  })

  it('accepts a bare number typed straight in', () => {
    expect(parseAmountInput('120312', VI)).toBe('120312')
  })

  it('keeps income negative', () => {
    expect(parseAmountInput('-120.312', VI)).toBe('-120312')
  })
})

describe('caretAfterFormat', () => {
  it('follows the digits rather than the offset', () => {
    // "120312" with the caret after the fourth digit becomes "120.312", where
    // the same four digits end one character further along.
    expect(caretAfterFormat('120.312', 4, VI)).toBe(5)
  })

  it('stays at the start of an empty field', () => {
    expect(caretAfterFormat('', 0, VI)).toBe(0)
  })

  it('lands at the end when everything is behind it', () => {
    expect(caretAfterFormat('120.312', 6, VI)).toBe(7)
  })
})

describe('significantBeforeCaret', () => {
  it('ignores the separators the caret has passed', () => {
    expect(significantBeforeCaret('120.312', 5, VI)).toBe(4)
    expect(significantBeforeCaret('120.312', 0, VI)).toBe(0)
  })
})
