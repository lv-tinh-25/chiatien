import { formatMonth } from '@/lib/format-month'

describe('formatMonth', () => {
  it('renders a YYYY-MM key as a short month and year', () => {
    expect(formatMonth('2020-03', 'en-US')).toBe('Mar 2020')
  })

  it('uses the locale', () => {
    expect(formatMonth('2020-03', 'vi')).toContain('2020')
  })

  it('is not shifted by the timezone', () => {
    // Built at UTC midday, so a negative offset cannot roll it into February.
    expect(formatMonth('2020-03', 'en-US')).toBe('Mar 2020')
    expect(formatMonth('2020-01', 'en-US')).toBe('Jan 2020')
    expect(formatMonth('2020-12', 'en-US')).toBe('Dec 2020')
  })

  it('returns the key unchanged when it is not a month', () => {
    expect(formatMonth('nonsense', 'en-US')).toBe('nonsense')
  })
})
