/**
 * The six categories the interface offers, keyed by the database ids the
 * `reduce_categories` migration keeps alive. The ids are the contract: renaming
 * a row is a migration, but a chip pointing at a missing id falls back to Other.
 */
export const CATEGORY_ACCOMMODATION = 11
export const CATEGORY_FOOD = 7
export const CATEGORY_TRANSPORT = 27
export const CATEGORY_LEISURE = 2
export const CATEGORY_SETTLEMENT = 1
export const CATEGORY_OTHER = 0

/** Chip order, taken from the design. */
export const CATEGORY_IDS: readonly number[] = [
  CATEGORY_ACCOMMODATION,
  CATEGORY_FOOD,
  CATEGORY_TRANSPORT,
  CATEGORY_LEISURE,
  CATEGORY_SETTLEMENT,
  CATEGORY_OTHER,
]

const EMOJI: Record<number, string> = {
  [CATEGORY_ACCOMMODATION]: '🏨',
  [CATEGORY_FOOD]: '🍜',
  [CATEGORY_TRANSPORT]: '🛵',
  [CATEGORY_LEISURE]: '🎫',
  [CATEGORY_SETTLEMENT]: '💸',
  [CATEGORY_OTHER]: '🧩',
}

/**
 * One participant-palette slot per category, so the lens behind an expense row
 * is tinted by what the money went on. The numbers index the `--participant-*`
 * tokens and carry no meaning beyond staying distinct from one another.
 */
const TONE_INDEX: Record<number, number> = {
  [CATEGORY_ACCOMMODATION]: 2,
  [CATEGORY_FOOD]: 6,
  [CATEGORY_TRANSPORT]: 1,
  [CATEGORY_LEISURE]: 4,
  [CATEGORY_SETTLEMENT]: 0,
  [CATEGORY_OTHER]: 5,
}

export function categoryEmoji(categoryId: number): string {
  return EMOJI[categoryId] ?? EMOJI[CATEGORY_OTHER]
}

export function categoryToneIndex(categoryId: number): number {
  return TONE_INDEX[categoryId] ?? TONE_INDEX[CATEGORY_OTHER]
}

/**
 * What a blank expense form opens on. Food is where most expenses land; a
 * repayment is a settlement and nothing else.
 */
export function defaultCategoryFor(isSettlement: boolean): number {
  return isSettlement ? CATEGORY_SETTLEMENT : CATEGORY_FOOD
}
