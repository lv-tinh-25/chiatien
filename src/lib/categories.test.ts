import {
  CATEGORY_ACCOMMODATION,
  CATEGORY_FOOD,
  CATEGORY_IDS,
  CATEGORY_LEISURE,
  CATEGORY_OTHER,
  CATEGORY_SETTLEMENT,
  CATEGORY_TRANSPORT,
  categoryEmoji,
  categoryToneIndex,
} from '@/lib/categories'

describe('categories', () => {
  it('offers exactly the six the design shows, in its order', () => {
    expect(CATEGORY_IDS).toEqual([
      CATEGORY_ACCOMMODATION,
      CATEGORY_FOOD,
      CATEGORY_TRANSPORT,
      CATEGORY_LEISURE,
      CATEGORY_SETTLEMENT,
      CATEGORY_OTHER,
    ])
  })

  it('gives every offered category a distinct emoji and tone', () => {
    const emoji = CATEGORY_IDS.map(categoryEmoji)
    const tones = CATEGORY_IDS.map(categoryToneIndex)
    expect(new Set(emoji).size).toBe(CATEGORY_IDS.length)
    expect(new Set(tones).size).toBe(CATEGORY_IDS.length)
  })

  it('falls back to Other for an id the migration removed', () => {
    expect(categoryEmoji(34)).toBe(categoryEmoji(CATEGORY_OTHER))
    expect(categoryToneIndex(34)).toBe(categoryToneIndex(CATEGORY_OTHER))
  })
})
