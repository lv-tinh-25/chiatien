'use client'

import { ExpenseForm } from '@/components/core/templates/ExpenseForm'
import { trpc } from '@/trpc/client'

export function EditExpensePageClient({
  groupId,
  expenseId,
  categoryExtractEnabled,
}: {
  groupId: string
  expenseId: string
  categoryExtractEnabled: boolean
}) {
  const { data } = trpc.groups.expenses.get.useQuery({ groupId, expenseId })
  if (!data) return null

  return (
    <ExpenseForm
      expense={data.expense}
      categoryExtractEnabled={categoryExtractEnabled}
    />
  )
}
