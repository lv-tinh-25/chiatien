function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function time(value: unknown): number | null {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

/**
 * Whether two sets of form values mean the same thing.
 *
 * react-hook-form's own `isDirty` cannot answer this here. It compares raw
 * values, so a field whose default is a number and whose input writes a string
 * — the amount, every time — stays dirty for ever after one keystroke, even
 * when the digits are put back exactly as they were. And it only counts a
 * `setValue` that was given `shouldDirty`, which most of this form's controls
 * are not: picking a payer, a category or a split mode left the form looking
 * untouched.
 *
 * So the comparison is on meaning rather than representation: a number equals
 * the string of that number, two dates equal by instant, and empty, null and
 * undefined are one state. The numeric rule is deliberately pair-aware — it
 * only applies when one side really is a number, so two strings such as "01"
 * and "1" stay different.
 */
export function sameFormValues(a: unknown, b: unknown): boolean {
  if (a instanceof Date || b instanceof Date) {
    const left = time(a)
    return left !== null && left === time(b)
  }

  if (isEmpty(a) || isEmpty(b)) return isEmpty(a) && isEmpty(b)

  if (typeof a === 'number' || typeof b === 'number') {
    const left = Number(a)
    const right = Number(b)
    return Number.isFinite(left) && Number.isFinite(right) && left === right
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    return (
      a.length === b.length &&
      a.every((item, index) => sameFormValues(item, b[index]))
    )
  }

  if (isRecord(a) && isRecord(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    return [...keys].every((key) => sameFormValues(a[key], b[key]))
  }

  return a === b
}
