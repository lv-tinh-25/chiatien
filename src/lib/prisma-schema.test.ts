import { RecurrenceRule, SplitMode } from '@/generated/prisma/browser'

describe('generated prisma client', () => {
  it('exposes every split mode the expense form offers', () => {
    expect(Object.keys(SplitMode).sort()).toEqual([
      'BY_AMOUNT',
      'BY_PERCENTAGE',
      'BY_SHARES',
      'EVENLY',
    ])
  })

  it('exposes every recurrence rule', () => {
    expect(Object.keys(RecurrenceRule).sort()).toEqual([
      'DAILY',
      'MONTHLY',
      'NONE',
      'WEEKLY',
    ])
  })
})
