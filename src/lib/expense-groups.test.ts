import {
  groupExpensesByDate,
  type ExpenseDateGroup,
} from '@/lib/expense-groups'
import dayjs from 'dayjs'

const MONDAY = dayjs('2026-07-08T12:00:00')

const at = (date: string) => ({ expenseDate: new Date(date) })

const groupOf = (date: string): ExpenseDateGroup =>
  groupExpensesByDate([at(date)], MONDAY, 1)[0].group

describe('groupExpensesByDate', () => {
  it('files a future expense under upcoming', () => {
    expect(groupOf('2026-07-20')).toBe('upcoming')
  })

  it('files an expense from the same week under this week', () => {
    expect(groupOf('2026-07-06')).toBe('thisWeek')
  })

  it('files an earlier expense in the same month separately', () => {
    expect(groupOf('2026-07-01')).toBe('earlierThisMonth')
  })

  it('files the previous month under last month', () => {
    expect(groupOf('2026-06-15')).toBe('lastMonth')
  })

  it('files an earlier month of the same year under earlier this year', () => {
    expect(groupOf('2026-02-15')).toBe('earlierThisYear')
  })

  it('files the previous year under last year', () => {
    expect(groupOf('2025-05-15')).toBe('lastYear')
  })

  it('files anything older under older', () => {
    expect(groupOf('2019-05-15')).toBe('older')
  })

  it('honours a Sunday week start', () => {
    // 2026-07-05 is the Sunday before the Monday reference date.
    expect(groupExpensesByDate([at('2026-07-05')], MONDAY, 0)[0].group).toBe(
      'thisWeek',
    )
    expect(groupExpensesByDate([at('2026-07-05')], MONDAY, 1)[0].group).toBe(
      'earlierThisMonth',
    )
  })

  it('keeps expenses in their original order inside a group', () => {
    const grouped = groupExpensesByDate(
      [at('2026-07-07'), at('2026-07-06')],
      MONDAY,
      1,
    )
    expect(grouped).toHaveLength(1)
    expect(grouped[0].expenses).toHaveLength(2)
    expect(grouped[0].expenses[0].expenseDate).toEqual(new Date('2026-07-07'))
  })

  it('returns groups in calendar order, newest first', () => {
    const grouped = groupExpensesByDate(
      [at('2019-01-01'), at('2026-07-20'), at('2026-06-15')],
      MONDAY,
      1,
    )
    expect(grouped.map((entry) => entry.group)).toEqual([
      'upcoming',
      'lastMonth',
      'older',
    ])
  })

  it('returns nothing for no expenses', () => {
    expect(groupExpensesByDate([], MONDAY, 1)).toEqual([])
  })
})
