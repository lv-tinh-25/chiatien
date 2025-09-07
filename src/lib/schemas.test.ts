import { expenseFormSchema } from '@/lib/schemas'

const base = {
  expenseDate: new Date('2026-09-07'),
  title: 'Dinner',
  category: 1,
  amount: 100,
  paidBy: 'a',
  splitMode: 'BY_AMOUNT' as const,
  saveDefaultSplittingOptions: false,
  isReimbursement: false,
  documents: [],
  recurrenceRule: 'NONE' as const,
}

describe('expenseFormSchema', () => {
  // Clearing a by-amount field leaves an empty string in the form for as long
  // as it takes to type the next number; `new Decimal('')` threw instead.
  it('rejects a blank by-amount share without throwing', () => {
    const result = expenseFormSchema.safeParse({
      ...base,
      paidFor: [
        { participant: 'a', shares: '100' },
        { participant: 'b', shares: '' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('still accepts by-amount shares that add up', () => {
    const result = expenseFormSchema.safeParse({
      ...base,
      paidFor: [
        { participant: 'a', shares: '60' },
        { participant: 'b', shares: '40' },
      ],
    })
    expect(result.success).toBe(true)
  })
})
