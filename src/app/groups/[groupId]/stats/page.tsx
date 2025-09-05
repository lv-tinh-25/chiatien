import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Stats')
  return { title: t('title') }
}

export default function StatsPage() {
  return <div />
}
