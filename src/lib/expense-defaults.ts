import type { SplittingOptions } from '@/lib/schemas'

type ParticipantRef = { id: string }

/**
 * Shares are strings here, not numbers: the form keeps raw input so trailing
 * zeros survive editing, and the schema coerces them on submit.
 */
export function defaultSplittingOptions(
  participants: ParticipantRef[],
): SplittingOptions {
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
): SplittingOptions {
  const fallback = defaultSplittingOptions(participants)
  if (stored === null) return fallback
  if (stored.paidFor === null) {
    return { splitMode: stored.splitMode, paidFor: fallback.paidFor }
  }

  const known = new Set(participants.map(({ id }) => id))
  const allKnown = stored.paidFor.every(({ participant }) =>
    known.has(participant),
  )
  return allKnown ? stored : fallback
}
