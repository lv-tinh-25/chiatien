'use client'

import { asLocale } from '@/i18n/locales'
import { currencyLabel } from '@/lib/currency-label'
import { getCurrencyFromGroup } from '@/lib/utils'
import { NO_ACTIVE_USER, useActiveUserStore } from '@/stores/useActiveUserStore'
import { trpc } from '@/trpc/client'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'

export function useGroupSettings() {
  const params = useParams<{ groupId: string }>()
  const groupId = params.groupId
  const locale = asLocale(useLocale())
  const { data, isPending } = trpc.groups.get.useQuery({ groupId })
  const group = data?.group ?? null

  const setActiveUser = useActiveUserStore((state) => state.setActiveUser)
  const activeUserId = useActiveUserStore((state) => {
    const stored = state.activeUsers[groupId]
    return stored === undefined || stored === NO_ACTIVE_USER ? null : stored
  })

  return {
    groupId,
    group,
    isPending,
    locale,
    editHref: `/groups/${groupId}/settings/edit`,
    name: group?.name ?? '',
    information: group?.information?.trim() ?? '',
    currency: group ? currencyLabel(getCurrencyFromGroup(group)) : '',
    participants: group?.participants ?? [],
    createdAt: group ? new Date(group.createdAt) : null,
    activeUserId,
    // Stored per device rather than in the group, so it saves as soon as it
    // changes instead of waiting for a form to be submitted.
    setActiveUser: (participantId: string | null) =>
      setActiveUser(groupId, participantId),
  }
}
