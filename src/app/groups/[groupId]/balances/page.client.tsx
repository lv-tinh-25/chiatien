'use client'

import { BalanceList } from '@/components/core/templates/BalanceList'
import { GroupHeader } from '@/components/core/templates/GroupHeader'

export function BalancesPageClient() {
  return (
    <>
      <GroupHeader />
      <BalanceList />
    </>
  )
}
