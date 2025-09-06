import { groupEmoji } from '@/lib/group-emoji'

const GLYPHS = ['🌲', '🏠', '🍱', '☕', '🎂', '🏔️', '🎒', '🎉']

describe('groupEmoji', () => {
  it('returns the same glyph every time for one id', () => {
    expect(groupEmoji('abcd1234')).toBe(groupEmoji('abcd1234'))
  })

  it('only ever returns a glyph from the palette', () => {
    for (const id of ['a', 'bb', 'ccc', 'dddd', 'eeeee', 'ffffff'])
      expect(GLYPHS).toContain(groupEmoji(id))
  })

  it('spreads ids across the palette', () => {
    const ids = Array.from({ length: 64 }, (_, i) => `group-${i}`)
    expect(new Set(ids.map(groupEmoji)).size).toBeGreaterThan(1)
  })
})
