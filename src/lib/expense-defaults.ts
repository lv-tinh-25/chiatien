import type { SplittingOptions } from '@/lib/schemas'

/** Splitting options that always name every participant. */
export type ConcreteSplittingOptions = SplittingOptions & {
  paidFor: NonNullable<SplittingOptions['paidFor']>
}

type ParticipantRef = { id: string }

/**
 * Shares are strings here, not numbers: the form keeps raw input so trailing
 * zeros survive editing, and the schema coerces them on submit.
 */
export function defaultSplittingOptions(
  participants: ParticipantRef[],
): ConcreteSplittingOptions {
  return {
    splitMode: 'EVENLY',
    paidFor: participants.map(({ id }) => ({ participant: id, shares: '1' })),
  }
}

/**
 * Validates remembered splitting options against the group as it stands now.
 * Options naming a participant who has since left would submit an expense
 * charged to someone the group no longer has, so they are discarded whole
 * rather than repaired.
 */
export function reconcileSplittingOptions(
  stored: SplittingOptions | null,
  participants: ParticipantRef[],
): ConcreteSplittingOptions {
  const fallback = defaultSplittingOptions(participants)
  if (stored === null) return fallback

  const paidFor = stored.paidFor
  if (paidFor === null) {
    return { splitMode: stored.splitMode, paidFor: fallback.paidFor }
  }

  const known = new Set(participants.map(({ id }) => id))
  const allKnown = paidFor.every(({ participant }) => known.has(participant))
  return allKnown ? { splitMode: stored.splitMode, paidFor } : fallback
}
