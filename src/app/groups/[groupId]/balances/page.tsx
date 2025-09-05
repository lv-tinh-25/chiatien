import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Balances')
  return { title: t('title') }
}

export default function BalancesPage() {
  return <div />
}
