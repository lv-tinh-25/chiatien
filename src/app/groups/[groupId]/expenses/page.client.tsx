'use client'

import { ActiveUserPrompt } from '@/components/core/templates/ActiveUserPrompt'
import { ExpenseList } from '@/components/core/templates/ExpenseList'
import { GroupHeader } from '@/components/core/templates/GroupHeader'
import { GroupScreen } from '@/components/core/templates/GroupScreen'
import { GroupSummaryAside } from '@/components/core/templates/GroupScreen/GroupSummaryAside'

export function ExpensesPageClient({
  receiptExtractEnabled,
}: {
  receiptExtractEnabled: boolean
}) {
  return (
    <>
      <GroupHeader />
      <GroupScreen aside={<GroupSummaryAside />}>
        <ExpenseList receiptExtractEnabled={receiptExtractEnabled} />
      </GroupScreen>
      <ActiveUserPrompt />
    </>
  )
}
