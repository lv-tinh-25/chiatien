import {
  defaultSplittingOptions,
  reconcileSplittingOptions,
} from '@/lib/expense-defaults'

const participants = [{ id: 'p1' }, { id: 'p2' }]

describe('defaultSplittingOptions', () => {
  it('splits evenly across every participant', () => {
    expect(defaultSplittingOptions(participants)).toEqual({
      splitMode: 'EVENLY',
      paidFor: [
        { participant: 'p1', shares: '1' },
        { participant: 'p2', shares: '1' },
      ],
    })
  })

  it('handles a group with a single participant', () => {
    expect(defaultSplittingOptions([{ id: 'p1' }]).paidFor).toHaveLength(1)
  })
})

describe('reconcileSplittingOptions', () => {
  it('returns the default when nothing was stored', () => {
    expect(reconcileSplittingOptions(null, participants)).toEqual(
      defaultSplittingOptions(participants),
    )
  })

  it('substitutes the default when the stored options name no participants', () => {
    const stored = { splitMode: 'BY_SHARES' as const, paidFor: null }
    expect(reconcileSplittingOptions(stored, participants)).toEqual({
      splitMode: 'BY_SHARES',
      paidFor: defaultSplittingOptions(participants).paidFor,
    })
  })

  it('discards options naming a participant who has left the group', () => {
    const stored = {
      splitMode: 'BY_AMOUNT' as const,
      paidFor: [{ participant: 'gone', shares: '5' }],
    }
    expect(reconcileSplittingOptions(stored, participants)).toEqual(
      defaultSplittingOptions(participants),
    )
  })

  it('keeps options whose participants all still exist', () => {
    const stored = {
      splitMode: 'BY_PERCENTAGE' as const,
      paidFor: [{ participant: 'p1', shares: '100' }],
    }
    expect(reconcileSplittingOptions(stored, participants)).toEqual(stored)
  })
})
