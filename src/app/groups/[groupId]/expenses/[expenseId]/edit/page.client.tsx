'use client'

import { ExpenseForm } from '@/components/core/templates/ExpenseForm'
import { ExpenseNotFound } from '@/components/core/templates/ExpenseForm/NotFound'
import { ExpenseFormSkeleton } from '@/components/core/templates/ExpenseForm/Skeleton'
import { trpc } from '@/trpc/client'

export function EditExpensePageClient({
  groupId,
  expenseId,
  categoryExtractEnabled,
  documentsEnabled,
}: {
  groupId: string
  expenseId: string
  categoryExtractEnabled: boolean
  documentsEnabled: boolean
}) {
  const { data, isPending } = trpc.groups.expenses.get.useQuery({
    groupId,
    expenseId,
  })

  if (isPending) return <ExpenseFormSkeleton />
  if (!data) return <ExpenseNotFound groupId={groupId} />

  return (
    <ExpenseForm
      expense={data.expense}
      categoryExtractEnabled={categoryExtractEnabled}
      documentsEnabled={documentsEnabled}
    />
  )
}
