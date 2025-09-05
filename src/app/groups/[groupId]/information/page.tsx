import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Information')
  return { title: t('title') }
}

export default function InformationPage() {
  return <div />
}
