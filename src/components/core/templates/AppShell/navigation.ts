export type NavKey = 'expenses' | 'balances' | 'stats' | 'activity' | 'settings'

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
  'settings',
]

const RESERVED = new Set(['create'])

/**
 * Derives the navigation chrome from the path alone, so no screen has to
 * declare where it sits. A nested route keeps its section active: editing the
 * settings is still being in the settings.
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

/**
 * The screen one level up, which is not the same as the screen visited last.
 * The five group destinations are siblings, so stepping back through history
 * walks sideways between them instead of leaving the group.
 *
 * Null means the screen is a root and shows no back affordance.
 */
export function parentOf(pathname: string): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname

  if (path === '/groups') return null
  if (path === '/groups/create') return '/groups'

  const match = path.match(/^\/groups\/([^/]+)(?:\/(.*))?$/)
  if (!match) return null

  const groupId = match[1]
  if (RESERVED.has(groupId)) return null

  const rest = match[2] ?? ''
  if (rest === '' || rest === 'expenses') return '/groups'

  // Anything under a section belongs to that section; a section itself belongs
  // to the group list, because the five are siblings rather than a chain.
  const [section, ...deeper] = rest.split('/')
  return deeper.length === 0 ? '/groups' : `/groups/${groupId}/${section}`
}
