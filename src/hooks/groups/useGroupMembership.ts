'use client'

import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { useToastStore } from '@/stores/useToastStore'
import { useTranslations } from 'next-intl'

/**
 * How one group sits in this browser's own list. The design draws no controls
 * on the group cards, so these three actions are reached from inside the group
 * instead — which is also the only place that knows which group is meant.
 */
export function useGroupMembership(groupId: string) {
  const t = useTranslations('Groups.RecentRemovedToast')
  const groups = useRecentGroupsStore((state) => state.groups)
  const starredIds = useRecentGroupsStore((state) => state.starredIds)
  const archivedIds = useRecentGroupsStore((state) => state.archivedIds)
  const toggleStar = useRecentGroupsStore((state) => state.toggleStar)
  const toggleArchive = useRecentGroupsStore((state) => state.toggleArchive)
  const forget = useRecentGroupsStore((state) => state.forget)
  const visit = useRecentGroupsStore((state) => state.visit)
  const showToast = useToastStore((state) => state.show)

  const remembered = groups.find((group) => group.id === groupId)

  return {
    remembered: remembered !== undefined,
    starred: starredIds.includes(groupId),
    archived: archivedIds.includes(groupId),
    toggleStar: () => toggleStar(groupId),
    toggleArchive: () => toggleArchive(groupId),
    forget: () => {
      if (remembered === undefined) return
      forget(groupId)
      showToast({
        title: t('title'),
        description: t('description'),
        action: {
          label: t('undo'),
          altLabel: t('undoAlt'),
          onAction: () => visit(remembered),
        },
      })
    },
  }
}
