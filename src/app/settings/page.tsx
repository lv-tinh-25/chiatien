import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Settings')
  return { title: t('title') }
}

export default function SettingsPage() {
  return <div />
}
