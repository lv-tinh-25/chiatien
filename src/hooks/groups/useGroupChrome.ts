'use client'

import {
  BOTTOM_DESTINATIONS,
  navigationFor,
} from '@/components/core/templates/AppShell/navigation'
import type { NavItem } from '@/components/core/templates/AppShell/navigation'
import type { Currency } from '@/lib/currency'
import { groupEmoji } from '@/lib/group-emoji'
import { getCurrencyFromGroup } from '@/lib/utils'
import { NO_ACTIVE_USER, useActiveUserStore } from '@/stores/useActiveUserStore'
import { trpc } from '@/trpc/client'
import { usePathname } from 'next/navigation'

/** `₫ VND` — the symbol the design leads with, then the code that disambiguates it. */
function currencyLabel(currency: Currency): string {
  return currency.code === ''
    ? currency.symbol_native
    : `${currency.symbol_native} ${currency.code}`
}

export type GroupChrome = {
  inGroup: boolean
  groupId: string | null
  items: NavItem[]
  bottomItems: NavItem[]
  name: string
  emoji: string
  participantCount: number
  currency: string
  activeUserName: string | null
  /** The one screen-level create action a phone shows, or none. */
  fab: { href: string; aboveNav: boolean } | null
}

/**
 * Everything the shell paints about the current group. It reads the path rather
 * than route params because the shell sits above the group segment, where
 * `useParams` has nothing to give it.
 */
export function useGroupChrome(): GroupChrome {
  const pathname = usePathname()
  const navigation = navigationFor(pathname)
  const groupId = navigation.scope === 'group' ? navigation.groupId : null

  const { data } = trpc.groups.get.useQuery(
    { groupId: groupId ?? '' },
    { enabled: groupId !== null },
  )
  const activeUserId = useActiveUserStore((state) => {
    const stored = groupId === null ? undefined : state.activeUsers[groupId]
    return stored === undefined || stored === NO_ACTIVE_USER ? null : stored
  })

  const group = data?.group ?? null
  const activeUser =
    group?.participants.find((participant) => participant.id === activeUserId) ??
    null

  const fab = (() => {
    if (pathname === '/groups')
      return { href: '/groups/create', aboveNav: false }
    if (groupId !== null && /^\/groups\/[^/]+\/expenses$/.test(pathname))
      return { href: `/groups/${groupId}/expenses/create`, aboveNav: true }
    return null
  })()

  return {
    inGroup: groupId !== null,
    groupId,
    items: navigation.items,
    bottomItems: navigation.items.filter((item) =>
      BOTTOM_DESTINATIONS.includes(item.key),
    ),
    name: group?.name ?? '',
    emoji: groupId === null ? '' : groupEmoji(groupId),
    participantCount: group?.participants.length ?? 0,
    currency: group ? currencyLabel(getCurrencyFromGroup(group)) : '',
    activeUserName: activeUser?.name ?? null,
    fab,
  }
}
