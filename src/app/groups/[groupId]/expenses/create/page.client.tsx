'use client'

import { ExpenseForm } from '@/components/core/templates/ExpenseForm'

export function CreateExpensePageClient({
  categoryExtractEnabled,
}: {
  categoryExtractEnabled: boolean
}) {
  return <ExpenseForm categoryExtractEnabled={categoryExtractEnabled} />
}
