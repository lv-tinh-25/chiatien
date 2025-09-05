'use client'

import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { trpc } from '@/trpc/client'
import { useEffect } from 'react'

/**
 * Records a group in this browser's list the first time its page is opened, so
 * a shared link turns into a remembered group without any extra step.
 *
 * The id is stored as soon as the page mounts and the name filled in when it
 * arrives, rather than waiting for the fetch: someone who opens a link and
 * navigates away immediately, or is on a slow connection, would otherwise lose
 * the group. The list renders server-supplied names anyway, so the placeholder
 * is never shown.
 */
export function SaveRecentGroup({ groupId }: { groupId: string }) {
  const visit = useRecentGroupsStore((state) => state.visit)
  const hydrated = useRecentGroupsStore((state) => state.hydrated)
  const { data } = trpc.groups.get.useQuery({ groupId })
  const name = data?.group?.name

  useEffect(() => {
    if (!hydrated) return
    visit({ id: groupId, name: name ?? '' })
  }, [hydrated, groupId, name, visit])

  return null
}
