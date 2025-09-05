import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Groups')
  return { title: t('recent') }
}

export default function GroupsPage() {
  return <div />
}
