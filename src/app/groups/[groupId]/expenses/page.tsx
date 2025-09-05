import { ExpensesPageClient } from '@/app/groups/[groupId]/expenses/page.client'
import { getRuntimeFeatureFlags } from '@/lib/featureFlags'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const t = await getTranslations('Expenses')
  return { title: t('title') }
}

export default async function ExpensesPage() {
  const { enableReceiptExtract } = await getRuntimeFeatureFlags()
  return <ExpensesPageClient receiptExtractEnabled={enableReceiptExtract} />
}
