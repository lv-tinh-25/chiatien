import { GroupSettingsPageClient } from '@/app/groups/[groupId]/settings/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Nav')
  return { title: t('settings') }
}

export default function GroupSettingsPage() {
  return <GroupSettingsPageClient />
}
