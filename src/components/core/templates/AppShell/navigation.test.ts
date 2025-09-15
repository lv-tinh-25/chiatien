import { navigationFor } from '@/components/core/templates/AppShell/navigation'

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
      'information',
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

  it('marks information active on the information screen', () => {
    const nav = navigationFor('/groups/abc123/information')
    expect(nav.items.find((item) => item.active)?.key).toBe('information')
  })

  it('marks nothing active on a group section with no destination', () => {
    const nav = navigationFor('/groups/abc123/edit')
    expect(nav.scope).toBe('group')
    expect(nav.items.some((item) => item.active)).toBe(false)
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
