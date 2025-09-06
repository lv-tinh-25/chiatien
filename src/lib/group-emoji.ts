/**
 * A group's face. The database carries no icon column and adding one would mean
 * changing ported schema, so the glyph is derived from the id instead: stable
 * for the life of the group, free, and identical on every device.
 */
const GLYPHS: readonly string[] = ['🌲', '🏠', '🍱', '☕', '🎂', '🏔️', '🎒', '🎉']

export function groupEmoji(groupId: string): string {
  let hash = 0
  for (let i = 0; i < groupId.length; i++)
    hash = (hash * 31 + groupId.charCodeAt(i)) >>> 0
  return GLYPHS[hash % GLYPHS.length]
}
