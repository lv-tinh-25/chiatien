'use client'

import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { useToastStore } from '@/stores/useToastStore'
import { Archive, ArchiveRestore, Star, StarOff, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * How one group sits in this browser's own list. The design draws no controls
 * on the group cards, so these three actions are reached from inside the group
 * instead — which is also the only place that knows which group is meant.
 *
 * None of it reaches the database: there are no accounts, so the server has no
 * identity to hang a star on, and a star stored there would be shared by
 * everyone holding the link.
 */
export function useGroupMembership(groupId: string) {
  const t = useTranslations('Groups.MembershipToast')
  const tRemoved = useTranslations('Groups.RecentRemovedToast')
  const groups = useRecentGroupsStore((state) => state.groups)
  const starredIds = useRecentGroupsStore((state) => state.starredIds)
  const archivedIds = useRecentGroupsStore((state) => state.archivedIds)
  const setStarred = useRecentGroupsStore((state) => state.setStarred)
  const setArchived = useRecentGroupsStore((state) => state.setArchived)
  const forget = useRecentGroupsStore((state) => state.forget)
  const visit = useRecentGroupsStore((state) => state.visit)
  const showToast = useToastStore((state) => state.show)

  const remembered = groups.find((group) => group.id === groupId)
  const starred = starredIds.includes(groupId)
  const archived = archivedIds.includes(groupId)

  /** The menu closes on the press, so the only way back is on the toast. */
  const undoable = (title: string, icon: typeof Star, undo: () => void) =>
    showToast({
      title,
      icon,
      action: {
        label: t('undo'),
        altLabel: t('undoAlt'),
        onAction: undo,
      },
    })

  return {
    remembered: remembered !== undefined,
    starred,
    archived,
    toggleStar: () => {
      const next = !starred
      setStarred(groupId, next)
      undoable(
        next ? t('starred') : t('unstarred'),
        next ? Star : StarOff,
        () => setStarred(groupId, starred),
      )
    },
    toggleArchive: () => {
      const next = !archived
      setArchived(groupId, next)
      undoable(
        next ? t('archived') : t('unarchived'),
        next ? Archive : ArchiveRestore,
        () => {
          setArchived(groupId, archived)
          // Archiving took the star with it, so putting the group back has to
          // hand it over as well or undo would only half undo.
          setStarred(groupId, starred)
        },
      )
    },
    forget: () => {
      if (remembered === undefined) return
      forget(groupId)
      showToast({
        title: tRemoved('title'),
        description: tRemoved('description'),
        action: {
          label: tRemoved('undo'),
          altLabel: tRemoved('undoAlt'),
          onAction: () => {
            visit(remembered)
            setStarred(groupId, starred)
            setArchived(groupId, archived)
          },
        },
        icon: Trash2,
      })
    },
  }
}
