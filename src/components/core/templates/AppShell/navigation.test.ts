import {
  navigationFor,
  parentOf,
} from '@/components/core/templates/AppShell/navigation'

describe('navigationFor', () => {
  it('shows no group navigation on the group list', () => {
    const nav = navigationFor('/groups')
    expect(nav.scope).toBe('app')
    expect(nav.groupId).toBeNull()
    expect(nav.items).toEqual([])
  })

  it('shows no group navigation on the create form', () => {
    expect(navigationFor('/groups/create').scope).toBe('app')
  })

  it('shows no group navigation outside /groups', () => {
    expect(navigationFor('/').scope).toBe('app')
  })

  it('shows five destinations inside a group', () => {
    const nav = navigationFor('/groups/abc123/expenses')
    expect(nav.scope).toBe('group')
    expect(nav.groupId).toBe('abc123')
    expect(nav.items.map((item) => item.key)).toEqual([
      'expenses',
      'balances',
      'stats',
      'activity',
      'settings',
    ])
  })

  it('marks the current destination active', () => {
    const nav = navigationFor('/groups/abc123/balances')
    expect(nav.items.find((item) => item.active)?.key).toBe('balances')
  })

  it('keeps expenses active on a nested expense route', () => {
    const nav = navigationFor('/groups/abc123/expenses/create')
    expect(nav.items.find((item) => item.active)?.key).toBe('expenses')
  })

  it('treats the group root as expenses', () => {
    const nav = navigationFor('/groups/abc123')
    expect(nav.items.find((item) => item.active)?.key).toBe('expenses')
  })

  it('marks settings active on the settings screen', () => {
    const nav = navigationFor('/groups/abc123/settings')
    expect(nav.items.find((item) => item.active)?.key).toBe('settings')
  })

  it('keeps settings active while they are being edited', () => {
    const nav = navigationFor('/groups/abc123/settings/edit')
    expect(nav.items.find((item) => item.active)?.key).toBe('settings')
  })

  it('builds hrefs under the current group', () => {
    const nav = navigationFor('/groups/abc123/expenses')
    expect(nav.items.find((item) => item.key === 'stats')?.href).toBe(
      '/groups/abc123/stats',
    )
  })

  it('ignores a trailing slash', () => {
    expect(navigationFor('/groups/abc123/').items).toHaveLength(5)
  })
})

describe('parentOf', () => {
  it('gives the group list no parent', () => {
    expect(parentOf('/groups')).toBeNull()
  })

  it('returns the group list from the create form', () => {
    expect(parentOf('/groups/create')).toBe('/groups')
  })

  it.each([
    '/groups/abc123',
    '/groups/abc123/expenses',
    '/groups/abc123/balances',
    '/groups/abc123/stats',
    '/groups/abc123/activity',
    '/groups/abc123/settings',
  ])('leaves the group from %s', (path) => {
    expect(parentOf(path)).toBe('/groups')
  })

  it('returns the expense list from the expense create form', () => {
    expect(parentOf('/groups/abc123/expenses/create')).toBe(
      '/groups/abc123/expenses',
    )
  })

  it('returns the expense list from an expense edit form', () => {
    expect(parentOf('/groups/abc123/expenses/xyz789/edit')).toBe(
      '/groups/abc123/expenses',
    )
  })

  it('returns the settings screen from the settings form', () => {
    expect(parentOf('/groups/abc123/settings/edit')).toBe(
      '/groups/abc123/settings',
    )
  })

  it('ignores a trailing slash', () => {
    expect(parentOf('/groups/abc123/settings/')).toBe('/groups')
  })

  it('has no parent for a path outside the app', () => {
    expect(parentOf('/')).toBeNull()
    expect(parentOf('/offline')).toBeNull()
  })
})
