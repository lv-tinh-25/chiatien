'use client'

import type { NavItem } from '@/components/core/templates/AppShell/navigation'
import { navigationFor } from '@/components/core/templates/AppShell/navigation'
import { currencyLabel } from '@/lib/currency-label'
import { groupEmoji } from '@/lib/group-emoji'
import { getCurrencyFromGroup } from '@/lib/utils'
import { NO_ACTIVE_USER, useActiveUserStore } from '@/stores/useActiveUserStore'
import { trpc } from '@/trpc/client'
import { usePathname } from 'next/navigation'

export type GroupChrome = {
  inGroup: boolean
  groupId: string | null
  items: NavItem[]
  name: string
  emoji: string
  participantCount: number
  currency: string
  activeUserName: string | null
  /** The one screen-level create action a phone shows, or none. */
  fab: { href: string; aboveNav: boolean } | null
  /** A form is a full-screen task: the bar would only crowd its submit. */
  showBottomNav: boolean
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
    group?.participants.find(
      (participant) => participant.id === activeUserId,
    ) ?? null

  const fab = (() => {
    if (pathname === '/groups')
      return { href: '/groups/create', aboveNav: false }
    if (groupId !== null && /^\/groups\/[^/]+\/expenses$/.test(pathname))
      return { href: `/groups/${groupId}/expenses/create`, aboveNav: true }
    return null
  })()

  const onForm =
    /\/expenses\/(create|[^/]+\/edit)$/.test(pathname) ||
    /^\/groups\/[^/]+\/settings\/edit$/.test(pathname)

  return {
    inGroup: groupId !== null,
    groupId,
    items: navigation.items,
    name: group?.name ?? '',
    emoji: groupId === null ? '' : groupEmoji(groupId),
    participantCount: group?.participants.length ?? 0,
    currency: group ? currencyLabel(getCurrencyFromGroup(group)) : '',
    activeUserName: activeUser?.name ?? null,
    fab,
    showBottomNav: groupId !== null && !onForm,
  }
}
