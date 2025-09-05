'use client'

import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { trpc } from '@/trpc/client'
import { useEffect } from 'react'

/**
 * Records a group in this browser's list the first time its page is opened, so
 * a link someone shared turns into a remembered group without any extra step.
 */
export function SaveRecentGroup({ groupId }: { groupId: string }) {
  const visit = useRecentGroupsStore((state) => state.visit)
  const hydrated = useRecentGroupsStore((state) => state.hydrated)
  const { data } = trpc.groups.get.useQuery({ groupId })
  const name = data?.group?.name

  useEffect(() => {
    if (!hydrated || name === undefined) return
    visit({ id: groupId, name })
  }, [hydrated, groupId, name, visit])

  return null
}
