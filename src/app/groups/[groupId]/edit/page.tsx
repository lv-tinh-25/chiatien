import { EditGroupPageClient } from '@/app/groups/[groupId]/edit/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('GroupForm')
  return { title: t('title') }
}

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  return <EditGroupPageClient groupId={groupId} />
}
