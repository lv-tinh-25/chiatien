import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Groups')
  return { title: t('create') }
}

export default function CreateGroupPage() {
  return <div />
}
