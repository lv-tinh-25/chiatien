import { CreateGroupPageClient } from '@/app/groups/create/page.client'
import { env } from '@/lib/env'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('GroupForm')
  return { title: t('createTitle') }
}

export default function CreateGroupPage() {
  return (
    <CreateGroupPageClient
      defaultCurrencyCode={
        env.DEFAULT_CURRENCY_CODE ??
        env.NEXT_PUBLIC_DEFAULT_CURRENCY_CODE ??
        'VND'
      }
    />
  )
}
