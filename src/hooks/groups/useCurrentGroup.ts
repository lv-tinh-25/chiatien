'use client'

import { asLocale } from '@/i18n/locales'
import { getCurrencyFromGroup } from '@/lib/utils'
import { NO_ACTIVE_USER, useActiveUserStore } from '@/stores/useActiveUserStore'
import { trpc } from '@/trpc/client'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'

export function useCurrentGroup() {
  const params = useParams<{ groupId: string }>()
  const groupId = params.groupId
  const locale = asLocale(useLocale())
  const { data, isPending } = trpc.groups.get.useQuery({ groupId })
  const group = data?.group ?? null
  const activeUserId = useActiveUserStore((state) => {
    const stored = state.activeUsers[groupId]
    return stored === undefined || stored === NO_ACTIVE_USER ? null : stored
  })

  return {
    groupId,
    group,
    isPending,
    locale,
    currency: group ? getCurrencyFromGroup(group) : null,
    activeUserId,
  }
}
