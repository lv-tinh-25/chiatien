'use client'

import { Button } from '@/components/core/atoms/Button'
import { Card } from '@/components/core/atoms/Card'
import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function GroupInfo() {
  const t = useTranslations('Information')
  const tNav = useTranslations('Nav')
  const { groupId, group, isPending } = useCurrentGroup()

  if (isPending) return null

  const information = group?.information?.trim() ?? ''

  return (
    <div className="flex max-w-190 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="hidden text-headline-lg font-extrabold text-foreground lg:block">
          {t('title')}
        </h1>
        <Button variant="outline" className="hidden lg:inline-flex" asChild>
          <Link href={`/groups/${groupId}/edit`}>{tNav('groupSettings')}</Link>
        </Button>
      </div>

      <Card className="p-5 lg:p-6">
        {information === '' ? (
          <p className="text-body-md text-muted-foreground">{t('empty')}</p>
        ) : (
          <p className="text-body-lg leading-relaxed whitespace-pre-wrap text-foreground">
            {information}
          </p>
        )}
      </Card>

      <p className="px-1 text-body-sm text-muted-foreground">
        {t('description')}
      </p>

      <Button variant="outline" className="w-full lg:hidden" asChild>
        <Link href={`/groups/${groupId}/edit`}>{tNav('groupSettings')}</Link>
      </Button>
    </div>
  )
}
