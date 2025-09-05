'use client'

import { ExpenseForm } from '@/components/core/templates/ExpenseForm'

export function CreateExpensePageClient({
  categoryExtractEnabled,
  documentsEnabled,
}: {
  categoryExtractEnabled: boolean
  documentsEnabled: boolean
}) {
  return (
    <ExpenseForm
      categoryExtractEnabled={categoryExtractEnabled}
      documentsEnabled={documentsEnabled}
    />
  )
}
