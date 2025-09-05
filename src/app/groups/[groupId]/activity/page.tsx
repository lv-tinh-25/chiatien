import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Activity')
  return { title: t('title') }
}

export default function ActivityPage() {
  return <div />
}
