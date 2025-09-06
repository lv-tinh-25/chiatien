/**
 * A group's face. The database carries no icon column and adding one would mean
 * changing ported schema, so the glyph and its tint are derived from the id
 * instead: stable for the life of the group, free, and identical on every
 * device.
 */
const GLYPHS: readonly string[] = [
  '🌲',
  '🏠',
  '🍱',
  '☕',
  '🎂',
  '🏔️',
  '🎒',
  '🎉',
]

function hashOf(groupId: string): number {
  let hash = 0
  for (let i = 0; i < groupId.length; i++)
    hash = (hash * 31 + groupId.charCodeAt(i)) >>> 0
  return hash
}

export function groupEmoji(groupId: string): string {
  return GLYPHS[hashOf(groupId) % GLYPHS.length]
}

/** Which participant hue tints the tile the glyph sits on. */
export function groupToneIndex(groupId: string): number {
  return hashOf(groupId)
}
