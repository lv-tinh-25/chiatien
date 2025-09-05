import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('GroupForm')
  return { title: t('title') }
}

export default function EditGroupPage() {
  return <div />
}
