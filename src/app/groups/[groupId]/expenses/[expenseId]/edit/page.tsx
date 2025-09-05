import { EditExpensePageClient } from '@/app/groups/[groupId]/expenses/[expenseId]/edit/page.client'
import { getRuntimeFeatureFlags } from '@/lib/featureFlags'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const t = await getTranslations('ExpenseForm')
  return { title: t('Expense.edit') }
}

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ groupId: string; expenseId: string }>
}) {
  const { groupId, expenseId } = await params
  const { enableCategoryExtract } = await getRuntimeFeatureFlags()

  return (
    <EditExpensePageClient
      groupId={groupId}
      expenseId={expenseId}
      categoryExtractEnabled={enableCategoryExtract}
    />
  )
}
