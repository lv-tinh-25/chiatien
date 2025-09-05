'use client'

import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { trpc } from '@/trpc/client'
import { useMemo } from 'react'

export function useBalanceList() {
  const { groupId, group, locale, currency, activeUserId } = useCurrentGroup()
  const { data, isPending } = trpc.groups.balances.list.useQuery({ groupId })

  const participantName = useMemo(() => {
    const names = new Map(
      (group?.participants ?? []).map((p) => [p.id, p.name]),
    )
    return (participantId: string) => names.get(participantId) ?? participantId
  }, [group])

  /**
   * Built from the group's participants, not from the balances the server
   * returns: those only cover people involved in a suggested reimbursement, so
   * anyone already settled would silently vanish from the table.
   */
  const balances = useMemo(() => {
    const totals = data?.balances ?? {}
    return (group?.participants ?? [])
      .map((participant) => ({
        participantId: participant.id,
        name: participant.name,
        total: totals[participant.id]?.total ?? 0,
      }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  }, [data, group])

  return {
    groupId,
    group,
    locale,
    currency,
    activeUserId,
    balances,
    reimbursements: data?.reimbursements ?? [],
    participantName,
    isPending,
    // The suggestion list is empty exactly when nobody owes anybody.
    isSettled: !isPending && (data?.reimbursements.length ?? 0) === 0,
  }
}
