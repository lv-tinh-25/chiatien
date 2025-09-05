/**
 * Formats a `YYYY-MM` bucket key for display.
 *
 * The date is built at UTC midday so a negative timezone offset cannot roll it
 * back into the previous month, which would relabel every bar.
 */
export function formatMonth(month: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return month

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1, 12))
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
