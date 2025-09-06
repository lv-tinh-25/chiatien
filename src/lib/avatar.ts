const PLACEHOLDER = '?'

/** `toLocaleUpperCase('vi')` keeps đ/Đ and the stacked diacritics intact. */
function head(name: string, length: number): string {
  return [...name.trim()].slice(0, length).join('').toLocaleUpperCase('vi')
}

/**
 * One letter, and a second only when someone else in the same group would
 * otherwise show the same one. The first name in `peers` keeps the short form,
 * so the result does not shuffle when the list is re-sorted.
 */
export function avatarInitials(
  name: string,
  peers: readonly string[] = [],
): string {
  const first = head(name, 1)
  if (!first) return PLACEHOLDER
  const sharing = peers.filter((peer) => head(peer, 1) === first)
  if (sharing.length < 2) return first
  return sharing[0].trim() === name.trim() ? first : head(name, 2)
}
