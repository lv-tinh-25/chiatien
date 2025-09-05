import type { Currency } from '@/lib/currency'
import { toExpensePayload } from '@/lib/expense-payload'
import type { ExpenseFormValues } from '@/lib/schemas'

const VND: Currency = {
  name: 'Đồng Việt Nam',
  symbol_native: '₫',
  symbol: '₫',
  code: 'VND',
  name_plural: 'Vietnamese dong',
  rounding: 0,
  decimal_digits: 0,
}

const USD: Currency = {
  name: 'US dollar',
  symbol_native: '$',
  symbol: '$',
  code: 'USD',
  name_plural: 'US dollars',
  rounding: 0,
  decimal_digits: 2,
}

const makeValues = (
  overrides: Partial<ExpenseFormValues> = {},
): ExpenseFormValues => ({
  expenseDate: new Date('2026-01-01'),
  title: 'Lunch',
  category: 0,
  amount: 100,
  originalCurrency: '',
  paidBy: 'p1',
  paidFor: [{ participant: 'p1', shares: 1 }],
  splitMode: 'EVENLY',
  saveDefaultSplittingOptions: false,
  isReimbursement: false,
  documents: [],
  recurrenceRule: 'NONE',
  ...overrides,
})

describe('toExpensePayload', () => {
  it('leaves a VND amount untouched because a minor unit is a dong', () => {
    expect(toExpensePayload(makeValues(), VND, VND, false).amount).toBe(100)
  })

  it('scales a USD amount into cents', () => {
    expect(toExpensePayload(makeValues(), USD, USD, false).amount).toBe(10000)
  })

  it('scales BY_AMOUNT shares into minor units too', () => {
    const values = makeValues({
      splitMode: 'BY_AMOUNT',
      paidFor: [{ participant: 'p1', shares: 100 }],
    })
    expect(toExpensePayload(values, USD, USD, false).paidFor[0].shares).toBe(
      10000,
    )
  })

  it('leaves shares alone for every other split mode', () => {
    const values = makeValues({
      splitMode: 'BY_SHARES',
      paidFor: [{ participant: 'p1', shares: 200 }],
    })
    expect(toExpensePayload(values, USD, USD, false).paidFor[0].shares).toBe(
      200,
    )
  })

  it('drops the conversion fields when no conversion took place', () => {
    const values = makeValues({
      originalAmount: 5,
      originalCurrency: 'USD',
      conversionRate: 2,
    })
    const out = toExpensePayload(values, VND, USD, false)
    expect(out.originalAmount).toBeUndefined()
    expect(out.originalCurrency).toBeUndefined()
    expect(out.conversionRate).toBeUndefined()
  })

  it('keeps and scales the original amount when a conversion took place', () => {
    const values = makeValues({
      originalAmount: 5,
      originalCurrency: 'USD',
      conversionRate: 2,
    })
    const out = toExpensePayload(values, VND, USD, true)
    expect(out.originalAmount).toBe(500)
    expect(out.conversionRate).toBe(2)
  })

  it('does not mutate the values it is given', () => {
    const values = makeValues()
    toExpensePayload(values, USD, USD, false)
    expect(values.amount).toBe(100)
  })
})
