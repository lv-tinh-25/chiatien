'use client'

import { ActiveUserPrompt } from '@/components/core/templates/ActiveUserPrompt'
import { ExpenseList } from '@/components/core/templates/ExpenseList'
import { GroupHeader } from '@/components/core/templates/GroupHeader'

export function ExpensesPageClient() {
  return (
    <>
      <GroupHeader />
      <ExpenseList />
      <ActiveUserPrompt />
    </>
  )
}
