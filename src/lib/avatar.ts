const PLACEHOLDER = '?'

/** `toLocaleUpperCase('vi')` keeps đ/Đ and the stacked diacritics intact. */
function head(name: string, length: number): string {
  return [...name.trim()].slice(0, length).join('').toLocaleUpperCase('vi')
}

/**
 * One letter, and a second only when someone else in the same group would
 * otherwise show the same one. The short form goes to whoever sorts first among
 * those sharing the letter — not to whoever the caller happened to list first —
 * so a participant keeps the same initials on every screen, however each screen
 * orders them.
 */
export function avatarInitials(
  name: string,
  peers: readonly string[] = [],
): string {
  const first = head(name, 1)
  if (!first) return PLACEHOLDER
  const sharing = peers
    .map((peer) => peer.trim())
    .filter((peer) => head(peer, 1) === first)
    .sort((a, b) => a.localeCompare(b, 'vi'))
  if (sharing.length < 2) return first
  return sharing[0] === name.trim() ? first : head(name, 2)
}
