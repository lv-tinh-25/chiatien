import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Expenses')
  return { title: t('title') }
}

export default function ExpensesPage() {
  return <div />
}
