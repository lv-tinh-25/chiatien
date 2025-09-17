'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Button } from '@/components/core/atoms/Button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { ActiveUserField } from '@/components/core/templates/GroupSettings/ActiveUserField'
import { GroupSettingsSkeleton } from '@/components/core/templates/GroupSettings/Skeleton'
import { useGroupSettings } from '@/hooks/groups/useGroupSettings'
import { formatDate } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ReactNode } from 'react'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0 md:flex-row md:items-baseline md:gap-4">
      <span className="text-label-md text-muted-foreground md:w-40 md:shrink-0">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-body-lg text-foreground">
        {children}
      </div>
    </div>
  )
}

export function GroupSettings() {
  const t = useTranslations('Groups.Settings')
  const tNav = useTranslations('Nav')
  const {
    isPending,
    locale,
    editHref,
    name,
    information,
    currency,
    participants,
    createdAt,
    activeUserId,
    setActiveUser,
  } = useGroupSettings()

  if (isPending) return <GroupSettingsSkeleton />

  return (
    <div className="flex max-w-190 flex-col gap-4">
      <div className="hidden items-center justify-between gap-3 lg:flex">
        <h1 className="text-headline-lg text-foreground">{tNav('settings')}</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={editHref}>{t('edit')}</Link>
        </Button>
      </div>

      <ActiveUserField
        participants={participants}
        activeUserId={activeUserId}
        onChange={setActiveUser}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('group')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <Row label={t('name')}>{name}</Row>
          <Row label={t('currency')}>{currency}</Row>
          <Row label={t('members', { count: participants.length })}>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {participants.map((participant) => (
                <li key={participant.id} className="flex items-center gap-2">
                  <Avatar
                    name={participant.name}
                    size="sm"
                    peers={participants.map((peer) => peer.name)}
                  />
                  <span className="text-body-md">{participant.name}</span>
                </li>
              ))}
            </ul>
          </Row>
          <Row label={t('note')}>
            {information === '' ? (
              <p className="text-body-md text-muted-foreground">{t('empty')}</p>
            ) : (
              <p className="whitespace-pre-wrap">{information}</p>
            )}
          </Row>
          {createdAt && (
            <Row label={t('created')}>
              <span className="text-body-md text-muted-foreground">
                {formatDate(createdAt, locale, { dateStyle: 'medium' })}
              </span>
            </Row>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full lg:hidden" asChild>
        <Link href={editHref}>{t('edit')}</Link>
      </Button>
    </div>
  )
}
