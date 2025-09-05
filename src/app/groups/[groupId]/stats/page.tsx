import { GroupStatsPageClient } from '@/app/groups/[groupId]/stats/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Stats')
  return { title: t('title') }
}

export default function GroupStatsPage() {
  return <GroupStatsPageClient />
}
