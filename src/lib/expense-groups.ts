import { isSameWeek } from '@/lib/date-groups'
import dayjs, { type Dayjs } from 'dayjs'

export const EXPENSE_DATE_GROUPS = [
  'upcoming',
  'thisWeek',
  'earlierThisMonth',
  'lastMonth',
  'earlierThisYear',
  'lastYear',
  'older',
] as const

export type ExpenseDateGroup = (typeof EXPENSE_DATE_GROUPS)[number]

export function expenseDateGroup(
  date: Dayjs,
  today: Dayjs,
  weekStartsOn: number,
): ExpenseDateGroup {
  if (today.isBefore(date)) return 'upcoming'
  if (isSameWeek(today, date, weekStartsOn)) return 'thisWeek'
  if (today.isSame(date, 'month')) return 'earlierThisMonth'
  if (today.subtract(1, 'month').isSame(date, 'month')) return 'lastMonth'
  if (today.isSame(date, 'year')) return 'earlierThisYear'
  if (today.subtract(1, 'year').isSame(date, 'year')) return 'lastYear'
  return 'older'
}

/**
 * Buckets expenses into the headings the list renders under, in calendar order
 * rather than the order the buckets happened to be filled. Empty buckets are
 * dropped so the caller can render straight through.
 */
export function groupExpensesByDate<T extends { expenseDate: Date }>(
  expenses: T[],
  today: Dayjs,
  weekStartsOn: number,
): { group: ExpenseDateGroup; expenses: T[] }[] {
  const buckets = new Map<ExpenseDateGroup, T[]>()

  for (const expense of expenses) {
    const group = expenseDateGroup(
      dayjs(expense.expenseDate),
      today,
      weekStartsOn,
    )
    const bucket = buckets.get(group) ?? []
    bucket.push(expense)
    buckets.set(group, bucket)
  }

  return EXPENSE_DATE_GROUPS.flatMap((group) => {
    const expensesInGroup = buckets.get(group)
    return expensesInGroup === undefined
      ? []
      : [{ group, expenses: expensesInGroup }]
  })
}
