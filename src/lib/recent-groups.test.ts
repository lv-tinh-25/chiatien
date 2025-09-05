import {
  addRecent,
  partitionGroups,
  removeRecent,
  toggleIn,
} from '@/lib/recent-groups'

describe('addRecent', () => {
  it('puts a newly visited group first', () => {
    expect(addRecent([{ id: 'a', name: 'A' }], { id: 'b', name: 'B' })).toEqual([
      { id: 'b', name: 'B' },
      { id: 'a', name: 'A' },
    ])
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
    expect(addRecent([{ id: 'a', name: 'Old' }], { id: 'a', name: 'New' })).toEqual(
      [{ id: 'a', name: 'New' }],
    )
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

  it('treats starring as stronger than archiving', () => {
    const result = partitionGroups(groups, ['c'], ['c'])
    expect(result.starred.map((group) => group.id)).toEqual(['c'])
    expect(result.archived).toEqual([])
  })

  it('returns three empty lists for an empty input', () => {
    expect(partitionGroups([], [], [])).toEqual({
      starred: [],
      recent: [],
      archived: [],
    })
  })
})
