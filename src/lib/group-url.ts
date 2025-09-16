/**
 * Accepts anything that contains a group id — a full share URL, a path, or the
 * bare id — because people paste all three.
 */
export function groupIdFromUrl(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const fromPath = /\/groups\/([^/?#]+)/.exec(trimmed)
  if (fromPath) return fromPath[1]
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null
}
