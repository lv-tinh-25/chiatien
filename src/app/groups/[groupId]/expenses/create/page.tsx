import { CreateExpensePageClient } from '@/app/groups/[groupId]/expenses/create/page.client'
import { getRuntimeFeatureFlags } from '@/lib/featureFlags'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const t = await getTranslations('Expenses')
  return { title: t('create') }
}

export default async function CreateExpensePage() {
  const { enableCategoryExtract, enableExpenseDocuments } =
    await getRuntimeFeatureFlags()
  return (
    <CreateExpensePageClient
      categoryExtractEnabled={enableCategoryExtract}
      documentsEnabled={enableExpenseDocuments}
    />
  )
}
