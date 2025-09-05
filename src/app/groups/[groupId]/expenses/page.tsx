import { ExpensesPageClient } from '@/app/groups/[groupId]/expenses/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Expenses')
  return { title: t('title') }
}

export default function ExpensesPage() {
  return <ExpensesPageClient />
}
