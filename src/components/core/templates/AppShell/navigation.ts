export type NavKey = 'expenses' | 'balances' | 'stats' | 'activity'

export type NavItem = {
  key: NavKey
  href: string
  active: boolean
}

export type Navigation = {
  scope: 'app' | 'group'
  groupId: string | null
  items: NavItem[]
}

export const GROUP_DESTINATIONS: NavKey[] = [
  'expenses',
  'balances',
  'stats',
  'activity',
]

const RESERVED = new Set(['create'])

/**
 * Derives the navigation chrome from the path alone, so no screen has to
 * declare where it sits. Sections without a bottom entry — information, edit —
 * are still group scope but leave every item inactive rather than lighting up
 * an unrelated one.
 */
export function navigationFor(pathname: string): Navigation {
  const match = pathname.match(/^\/groups\/([^/]+)(?:\/([^/]+))?/)
  const groupId = match?.[1] ?? null

  if (!groupId || RESERVED.has(groupId)) {
    return { scope: 'app', groupId: null, items: [] }
  }

  const section = match?.[2] || 'expenses'
  return {
    scope: 'group',
    groupId,
    items: GROUP_DESTINATIONS.map((key) => ({
      key,
      href: `/groups/${groupId}/${key}`,
      active: section === key,
    })),
  }
}
