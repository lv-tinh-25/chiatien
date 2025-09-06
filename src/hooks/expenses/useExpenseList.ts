'use client'

import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { getWeekStartsOn } from '@/lib/date-groups'
import { groupExpensesByDate } from '@/lib/expense-groups'
import { trpc } from '@/trpc/client'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useDebounce } from 'use-debounce'

const PAGE_SIZE = 20

export function useExpenseList() {
  const { groupId, group, locale, currency, activeUserId } = useCurrentGroup()
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const { ref: sentinelRef, inView } = useInView()

  const query = trpc.groups.expenses.list.useInfiniteQuery(
    { groupId, limit: PAGE_SIZE, filter: debouncedSearch },
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
    },
  )

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const expenses = useMemo(
    () => query.data?.pages.flatMap((page) => page.expenses) ?? [],
    [query.data],
  )

  const sections = useMemo(
    () => groupExpensesByDate(expenses, dayjs(), getWeekStartsOn(locale)),
    [expenses, locale],
  )

  return {
    groupId,
    group,
    locale,
    currency,
    activeUserId,
    sections,
    isPending: query.isPending,
    // An empty result while a search is active is "nothing matched", not
    // "no expenses yet", and the two need different copy.
    isEmpty:
      !query.isPending && expenses.length === 0 && debouncedSearch === '',
    isSearchMiss:
      !query.isPending && expenses.length === 0 && debouncedSearch !== '',
    search,
    setSearch,
    sentinelRef,
    isFetchingNextPage,
  }
}
