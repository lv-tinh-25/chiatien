import { GroupsPageClient } from '@/app/groups/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Groups')
  return { title: t('myGroups') }
}

export default function GroupsPage() {
  return <GroupsPageClient />
}
