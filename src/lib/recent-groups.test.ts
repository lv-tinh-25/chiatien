import {
  addRecent,
  partitionGroups,
  removeRecent,
  setArchived,
  setStarred,
  toggleIn,
} from '@/lib/recent-groups'

describe('addRecent', () => {
  it('puts a newly visited group first', () => {
    expect(addRecent([{ id: 'a', name: 'A' }], { id: 'b', name: 'B' })).toEqual(
      [
        { id: 'b', name: 'B' },
        { id: 'a', name: 'A' },
      ],
    )
  })

  it('moves an already known group to the front instead of duplicating it', () => {
    const list = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]
    expect(addRecent(list, { id: 'b', name: 'B' })).toEqual([
      { id: 'b', name: 'B' },
      { id: 'a', name: 'A' },
    ])
  })

  it('refreshes a renamed group', () => {
    expect(
      addRecent([{ id: 'a', name: 'Old' }], { id: 'a', name: 'New' }),
    ).toEqual([{ id: 'a', name: 'New' }])
  })
})

describe('removeRecent', () => {
  it('drops the named group and leaves the rest in order', () => {
    const list = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]
    expect(removeRecent(list, 'a')).toEqual([{ id: 'b', name: 'B' }])
  })

  it('is a no-op for an unknown id', () => {
    expect(removeRecent([{ id: 'a', name: 'A' }], 'zz')).toEqual([
      { id: 'a', name: 'A' },
    ])
  })
})

describe('toggleIn', () => {
  it('adds an id that is absent', () => {
    expect(toggleIn([], 'a')).toEqual(['a'])
  })

  it('removes an id that is present', () => {
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('partitionGroups', () => {
  const groups = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
    { id: 'c', name: 'C' },
  ]

  it('splits into starred, recent and archived, preserving order', () => {
    expect(partitionGroups(groups, ['b'], ['c'])).toEqual({
      starred: [{ id: 'b', name: 'B' }],
      recent: [{ id: 'a', name: 'A' }],
      archived: [{ id: 'c', name: 'C' }],
    })
  })

  /**
   * The two flags cannot both be set any more, but storage written before that
   * rule can still carry both — and the menu offers no way to unstar an
   * archived group, so rendering it under Starred would strand it.
   */
  it('treats archiving as stronger than starring', () => {
    const result = partitionGroups(groups, ['c'], ['c'])
    expect(result.archived.map((group) => group.id)).toEqual(['c'])
    expect(result.starred).toEqual([])
  })

  it('returns three empty lists for an empty input', () => {
    expect(partitionGroups([], [], [])).toEqual({
      starred: [],
      recent: [],
      archived: [],
    })
  })
})

describe('setStarred', () => {
  it('stars a group without touching what is archived', () => {
    expect(
      setStarred({ starredIds: [], archivedIds: ['b'] }, 'a', true),
    ).toEqual({ starredIds: ['a'], archivedIds: ['b'] })
  })

  it('unstars a group', () => {
    expect(
      setStarred({ starredIds: ['a', 'b'], archivedIds: [] }, 'a', false),
    ).toEqual({ starredIds: ['b'], archivedIds: [] })
  })

  it('is idempotent', () => {
    const state = { starredIds: ['a'], archivedIds: [] }
    expect(setStarred(state, 'a', true)).toEqual(state)
    expect(setStarred({ starredIds: [], archivedIds: [] }, 'a', false)).toEqual(
      {
        starredIds: [],
        archivedIds: [],
      },
    )
  })
})

describe('setArchived', () => {
  it('takes the star with it when archiving', () => {
    expect(
      setArchived({ starredIds: ['a', 'b'], archivedIds: [] }, 'a', true),
    ).toEqual({ starredIds: ['b'], archivedIds: ['a'] })
  })

  it('archives a group that was never starred', () => {
    expect(setArchived({ starredIds: [], archivedIds: [] }, 'a', true)).toEqual(
      {
        starredIds: [],
        archivedIds: ['a'],
      },
    )
  })

  it('does not hand the star back on unarchiving', () => {
    const archived = setArchived(
      { starredIds: ['a'], archivedIds: [] },
      'a',
      true,
    )
    expect(setArchived(archived, 'a', false)).toEqual({
      starredIds: [],
      archivedIds: [],
    })
  })

  it('leaves another group\u2019s flags alone', () => {
    expect(
      setArchived({ starredIds: ['b'], archivedIds: ['c'] }, 'a', true),
    ).toEqual({ starredIds: ['b'], archivedIds: ['c', 'a'] })
  })
})
