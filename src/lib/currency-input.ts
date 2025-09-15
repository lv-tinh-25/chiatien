/**
 * Normalises money as the user types it.
 *
 * The replacements are order-dependent: a leading minus and the first separator
 * are parked on placeholder characters so the blanket strip in the middle cannot
 * eat them, then restored. Reordering these changes what the user can type.
 */
export function enforceCurrencyPattern(value: string): string {
  return value
    .replace(/^\s*-/, '_')
    .replace(/[.,]/, '#')
    .replace(/[-.,]/g, '')
    .replace(/_/, '-')
    .replace(/#/, '.')
    .replace(/[^-\d.]/g, '')
}

export type AmountSeparators = { group: string; decimal: string }

/**
 * The marks the reader's own language uses. Taken from Intl rather than a table
 * because they are not just swapped between locales — some put a space between
 * groups — and a wrong guess would be read as a different number.
 */
export function amountSeparators(locale: string): AmountSeparators {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6)
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  }
}

/**
 * A raw amount as its field should read: `120312` becomes `120.312` for a
 * Vietnamese reader and `120,312` for an English one.
 *
 * Grouping is display only. The raw string is what the schema parses, and a
 * grouped one would parse as an entirely different number — `120.312` is a
 * hundred and twenty in every locale JavaScript knows.
 */
export function formatAmountForInput(
  raw: string,
  separators: AmountSeparators,
): string {
  if (raw === '' || raw === '-') return raw
  const negative = raw.startsWith('-')
  const body = negative ? raw.slice(1) : raw
  const [whole, fraction] = body.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separators.group)
  // A separator with nothing after it yet is what the user has just typed, so
  // it has to survive the round trip or the next digit lands in the wrong place.
  const tail = body.includes('.') ? separators.decimal + (fraction ?? '') : ''
  return (negative ? '-' : '') + grouped + tail
}

/** What the field now reads, back to the raw form value. */
export function parseAmountInput(
  display: string,
  separators: AmountSeparators,
): string {
  const ungrouped = display.split(separators.group).join('')
  const pointed =
    separators.decimal === '.'
      ? ungrouped
      : ungrouped.split(separators.decimal).join('.')
  return enforceCurrencyPattern(pointed)
}

/**
 * Where the caret belongs once the field has been re-grouped.
 *
 * Only separators move, so the caret keeps its place among the characters that
 * are not separators. Counting instead of offsetting is what stops it jumping a
 * digit every time a group boundary is crossed.
 */
export function caretAfterFormat(
  formatted: string,
  significantBefore: number,
  separators: AmountSeparators,
): number {
  if (significantBefore <= 0) return 0
  let seen = 0
  for (let index = 0; index < formatted.length; index += 1) {
    if (formatted[index] !== separators.group) seen += 1
    if (seen === significantBefore) return index + 1
  }
  return formatted.length
}

/** The characters before `caret` that grouping is free to move past. */
export function significantBeforeCaret(
  typed: string,
  caret: number,
  separators: AmountSeparators,
): number {
  return typed
    .slice(0, caret)
    .split('')
    .filter((character) => character !== separators.group).length
}
