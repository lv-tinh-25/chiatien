'use client'

import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import {
  resolveStatsRange,
  type StatsPeriod,
  type StatsRange,
} from '@/lib/stats-range'
import { trpc } from '@/trpc/client'
import { useMemo, useState } from 'react'

export function useGroupStats() {
  const { groupId, group, locale, currency, activeUserId } = useCurrentGroup()
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const [customRange, setCustomRange] = useState<StatsRange>({})

  const range = useMemo(
    () => resolveStatsRange(period, customRange),
    [period, customRange],
  )

  const { data, isPending } = trpc.groups.stats.overview.useQuery({
    groupId,
    participantId: activeUserId ?? undefined,
    from: range.from,
    to: range.to,
  })

  return {
    groupId,
    group,
    locale,
    currency,
    activeUserId,
    period,
    setPeriod,
    customRange,
    setCustomRange,
    range,
    stats: data,
    isPending,
  }
}
