'use client'

import { partitionGroups, type RecentGroups } from '@/lib/recent-groups'
import { useActiveUserStore } from '@/stores/useActiveUserStore'
import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { trpc } from '@/trpc/client'
import { useMemo } from 'react'

export function useGroupList() {
  const hydrated = useRecentGroupsStore((state) => state.hydrated)
  const groups = useRecentGroupsStore((state) => state.groups)
  const starredIds = useRecentGroupsStore((state) => state.starredIds)
  const archivedIds = useRecentGroupsStore((state) => state.archivedIds)
  const toggleStar = useRecentGroupsStore((state) => state.toggleStar)
  const toggleArchive = useRecentGroupsStore((state) => state.toggleArchive)
  const forget = useRecentGroupsStore((state) => state.forget)
  const visit = useRecentGroupsStore((state) => state.visit)
  const activeUsers = useActiveUserStore((state) => state.activeUsers)

  const groupIds = useMemo(() => groups.map((group) => group.id), [groups])

  const details = trpc.groups.list.useQuery(
    { groupIds },
    { enabled: hydrated && groupIds.length > 0 },
  )

  // Only groups this browser has identified itself in can contribute a balance.
  const balanceInput = useMemo(
    () =>
      groupIds
        .filter((groupId) => activeUsers[groupId] !== undefined)
        .map((groupId) => ({ groupId, participantId: activeUsers[groupId] })),
    [groupIds, activeUsers],
  )

  const balances = trpc.groups.balances.forUser.useQuery(
    { groups: balanceInput },
    { enabled: hydrated && balanceInput.length > 0 },
  )

  /**
   * The list is rebuilt from the server's names rather than the remembered
   * ones, so a group renamed on another device shows its current name. A
   * remembered group the server no longer has is dropped from the render but
   * left in storage: a transient fetch failure should not erase someone's list.
   */
  const known: RecentGroups = useMemo(() => {
    const byId = new Map(
      (details.data?.groups ?? []).map((group) => [group.id, group.name]),
    )
    return groups.flatMap((group) => {
      const name = byId.get(group.id)
      return name === undefined ? [] : [{ id: group.id, name }]
    })
  }, [groups, details.data])

  const partitioned = useMemo(
    () => partitionGroups(known, starredIds, archivedIds),
    [known, starredIds, archivedIds],
  )

  const status = !hydrated
    ? 'pending'
    : groupIds.length === 0
      ? 'empty'
      : details.isPending
        ? 'pending'
        : 'ready'

  return {
    status,
    ...partitioned,
    balances: balances.data?.balances ?? [],
    toggleStar,
    toggleArchive,
    forget,
    visit,
    isStarred: (groupId: string) => starredIds.includes(groupId),
    isArchived: (groupId: string) => archivedIds.includes(groupId),
  }
}
