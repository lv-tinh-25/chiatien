'use client'

import { Button } from '@/components/core/atoms/Button'
import { Card } from '@/components/core/atoms/Card'
import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { formatDate } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

export function GroupInfo() {
  const t = useTranslations('Information')
  const locale = useLocale()
  const { groupId, group, isPending } = useCurrentGroup()

  if (isPending) return null

  const information = group?.information?.trim() ?? ''

  return (
    <div className="flex max-w-190 flex-col gap-4">
      <div className="hidden items-center justify-between gap-3 lg:flex">
        <h1 className="text-headline-lg text-foreground">{t('title')}</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/groups/${groupId}/edit`}>{t('edit')}</Link>
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

      {/* The only provenance the ported schema records. */}
      {group && (
        <p className="px-1 text-body-sm text-muted-foreground">
          {t('meta', {
            created: formatDate(new Date(group.createdAt), locale, {
              dateStyle: 'medium',
            }),
          })}
        </p>
      )}

      <Button variant="outline" className="w-full lg:hidden" asChild>
        <Link href={`/groups/${groupId}/edit`}>{t('edit')}</Link>
      </Button>
    </div>
  )
}
