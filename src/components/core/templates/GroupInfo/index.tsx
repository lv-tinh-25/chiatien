'use client'

import { Button } from '@/components/core/atoms/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
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
    <Card className="my-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4">
        {information === '' ? (
          <p className="text-body-md text-muted-foreground">{t('empty')}</p>
        ) : (
          <p className="text-body-lg whitespace-pre-wrap text-foreground">
            {information}
          </p>
        )}
        <Button variant="outline" asChild>
          <Link href={`/groups/${groupId}/edit`}>{tNav('groupSettings')}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
