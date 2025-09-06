import { formatExpenseDate } from './expense-date'

const today = new Date(2026, 8, 6)

describe('formatExpenseDate', () => {
  it('leaves the year off a date in the current year', () => {
    const formatted = formatExpenseDate(
      new Date('2026-09-06T00:00:00.000Z'),
      'en-US',
      today,
    )
    expect(formatted).toBe('Sep 6')
  })

  it('adds the year once the date falls outside it', () => {
    const formatted = formatExpenseDate(
      new Date('2025-12-31T00:00:00.000Z'),
      'en-US',
      today,
    )
    expect(formatted).toBe('Dec 31, 2025')
  })

  it('reads the stored date in UTC, not locally', () => {
    const formatted = formatExpenseDate(
      new Date('2026-01-01T00:00:00.000Z'),
      'en-US',
      today,
    )
    expect(formatted).toBe('Jan 1')
  })
})
