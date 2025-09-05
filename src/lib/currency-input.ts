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
