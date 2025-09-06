'use client'

import { ActiveUserPrompt } from '@/components/core/templates/ActiveUserPrompt'
import { ExpenseList } from '@/components/core/templates/ExpenseList'
import { GroupScreen } from '@/components/core/templates/GroupScreen'
import { GroupSummaryAside } from '@/components/core/templates/GroupScreen/GroupSummaryAside'

export function ExpensesPageClient({
  receiptExtractEnabled,
}: {
  receiptExtractEnabled: boolean
}) {
  return (
    <>
      <GroupScreen aside={<GroupSummaryAside />}>
        <ExpenseList receiptExtractEnabled={receiptExtractEnabled} />
      </GroupScreen>
      <ActiveUserPrompt />
    </>
  )
}
