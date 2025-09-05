import { ActivityLogPageClient } from '@/app/groups/[groupId]/activity/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Activity')
  return { title: t('title') }
}

export default function ActivityLogPage() {
  return <ActivityLogPageClient />
}
