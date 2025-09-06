'use client'

import type { Currency } from '@/lib/currency'
import { partitionGroups, type RecentGroup } from '@/lib/recent-groups'
import { getCurrencyFromGroup } from '@/lib/utils'
import { NO_ACTIVE_USER, useActiveUserStore } from '@/stores/useActiveUserStore'
import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { useToastStore } from '@/stores/useToastStore'
import { trpc } from '@/trpc/client'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export type GroupListEntry = {
  id: string
  name: string
  participantCount: number
  expenseCount: number
  /** Absent until this browser says who it is in that group. */
  balance: { amount: number; currency: Currency } | null
}

export function useGroupList() {
  const t = useTranslations('Groups.RecentRemovedToast')
  const hydrated = useRecentGroupsStore((state) => state.hydrated)
  const groups = useRecentGroupsStore((state) => state.groups)
  const starredIds = useRecentGroupsStore((state) => state.starredIds)
  const archivedIds = useRecentGroupsStore((state) => state.archivedIds)
  const toggleStar = useRecentGroupsStore((state) => state.toggleStar)
  const toggleArchive = useRecentGroupsStore((state) => state.toggleArchive)
  const forget = useRecentGroupsStore((state) => state.forget)
  const visit = useRecentGroupsStore((state) => state.visit)
  const activeUsers = useActiveUserStore((state) => state.activeUsers)
  const showToast = useToastStore((state) => state.show)

  const groupIds = useMemo(() => groups.map((group) => group.id), [groups])

  const details = trpc.groups.list.useQuery(
    { groupIds },
    { enabled: hydrated && groupIds.length > 0 },
  )

  /**
   * Only groups this browser has identified itself in can contribute a balance.
   * The stored value is checked for being a real id rather than merely present:
   * localStorage is user-writable, and a null there would otherwise be sent to
   * a procedure whose schema rejects it.
   */
  const balanceInput = useMemo(
    () =>
      groupIds.flatMap((groupId) => {
        const participantId = activeUsers[groupId]
        return typeof participantId !== 'string' ||
          participantId === '' ||
          participantId === NO_ACTIVE_USER
          ? []
          : [{ groupId, participantId }]
      }),
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
  const known: GroupListEntry[] = useMemo(() => {
    const byId = new Map(
      (details.data?.groups ?? []).map((group) => [group.id, group]),
    )
    const balanceById = new Map(
      (balances.data?.balances ?? []).map((balance) => [
        balance.groupId,
        balance,
      ]),
    )
    return groups.flatMap((group) => {
      const detail = byId.get(group.id)
      if (detail === undefined) return []
      const balance = balanceById.get(group.id)
      return [
        {
          id: detail.id,
          name: detail.name,
          participantCount: detail._count.participants,
          expenseCount: detail._count.expenses,
          balance:
            balance === undefined
              ? null
              : {
                  amount: balance.amount,
                  currency: getCurrencyFromGroup(balance),
                },
        },
      ]
    })
  }, [groups, details.data, balances.data])

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
    forget: (group: RecentGroup) => {
      forget(group.id)
      showToast({
        title: t('title'),
        description: t('description'),
        action: {
          label: t('undo'),
          altLabel: t('undoAlt'),
          onAction: () => visit(group),
        },
      })
    },
    visit,
    isStarred: (groupId: string) => starredIds.includes(groupId),
    isArchived: (groupId: string) => archivedIds.includes(groupId),
  }
}
