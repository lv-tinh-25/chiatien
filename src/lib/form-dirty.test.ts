import { sameFormValues } from './form-dirty'

describe('sameFormValues', () => {
  it('reads a number and its own digits as one value', () => {
    expect(sameFormValues(50, '50')).toBe(true)
    expect(sameFormValues('50.00', 50)).toBe(true)
    expect(sameFormValues(50, '51')).toBe(false)
  })

  it('keeps two strings apart even when both look numeric', () => {
    expect(sameFormValues('01', '1')).toBe(false)
  })

  it('treats empty, null and undefined as one state', () => {
    expect(sameFormValues('', null)).toBe(true)
    expect(sameFormValues(undefined, '')).toBe(true)
    expect(sameFormValues('', 'a')).toBe(false)
    expect(sameFormValues('', 0)).toBe(false)
  })

  it('compares dates by instant, however they are written', () => {
    const date = new Date('2026-09-17T00:00:00.000Z')
    expect(sameFormValues(date, new Date(date.getTime()))).toBe(true)
    expect(sameFormValues(date, '2026-09-17T00:00:00.000Z')).toBe(true)
    expect(sameFormValues(date, new Date('2026-09-18'))).toBe(false)
  })

  it('walks arrays element by element', () => {
    expect(sameFormValues([{ shares: 1 }], [{ shares: '1' }])).toBe(true)
    expect(sameFormValues([{ shares: 1 }], [{ shares: 2 }])).toBe(false)
    expect(sameFormValues([1], [1, 2])).toBe(false)
  })

  it('walks objects by the union of their keys', () => {
    expect(sameFormValues({ a: 1 }, { a: 1, b: undefined })).toBe(true)
    expect(sameFormValues({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  it('answers for a whole expense form', () => {
    const defaults = {
      title: 'Lunch',
      amount: 50,
      paidBy: 'alice',
      expenseDate: new Date('2026-09-17'),
      paidFor: [{ participant: 'alice', shares: '1' }],
      notes: '',
    }
    const typedAndPutBack = {
      ...defaults,
      amount: '50',
      notes: undefined,
    }
    expect(sameFormValues(defaults, typedAndPutBack)).toBe(true)
    expect(sameFormValues(defaults, { ...defaults, paidBy: 'bob' })).toBe(false)
    expect(
      sameFormValues(defaults, {
        ...defaults,
        paidFor: [{ participant: 'alice', shares: '2' }],
      }),
    ).toBe(false)
  })

  it('compares booleans exactly', () => {
    expect(sameFormValues(false, false)).toBe(true)
    expect(sameFormValues(false, true)).toBe(false)
  })
})
