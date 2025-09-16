import { EditGroupPageClient } from '@/app/groups/[groupId]/settings/edit/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Nav')
  return { title: t('editSettingsTitle') }
}

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  return <EditGroupPageClient groupId={groupId} />
}
