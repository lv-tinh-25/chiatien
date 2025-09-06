/**
 * The design prints `6 thg 9` and reaches for the year only when the expense
 * falls outside the current one — the section heading above the row already
 * says how far back the reader is.
 *
 * UTC components, like the ported `formatDateOnly`: an expense date is a DATE
 * column, and reading it locally shifts it a day either side of midnight.
 */
export function formatExpenseDate(
  date: Date,
  locale: string,
  today: Date = new Date(),
): string {
  const year = date.getUTCFullYear()
  const local = new Date(year, date.getUTCMonth(), date.getUTCDate())
  return local.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    ...(year === today.getFullYear() ? {} : { year: 'numeric' }),
  })
}
