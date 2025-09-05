'use client'

import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { trpc } from '@/trpc/client'
import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

const PAGE_SIZE = 20

export function useActivityLog() {
  const { groupId, group, locale } = useCurrentGroup()
  const { ref: sentinelRef, inView } = useInView()

  const query = trpc.groups.activities.list.useInfiniteQuery(
    { groupId, limit: PAGE_SIZE },
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    },
  )

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const activities = useMemo(
    () => query.data?.pages.flatMap((page) => page.activities) ?? [],
    [query.data],
  )

  const participantName = useMemo(() => {
    const names = new Map((group?.participants ?? []).map((p) => [p.id, p.name]))
    return (participantId: string | null) =>
      participantId === null ? null : (names.get(participantId) ?? null)
  }, [group])

  return {
    groupId,
    locale,
    activities,
    participantName,
    isPending: query.isPending,
    isEmpty: !query.isPending && activities.length === 0,
    sentinelRef,
  }
}
