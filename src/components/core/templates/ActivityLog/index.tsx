'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { useActivityLog } from '@/hooks/activities/useActivityLog'
import { formatDateOnly } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const MESSAGE_KEYS = {
  UPDATE_GROUP: 'settingsModified',
  CREATE_EXPENSE: 'expenseCreated',
  UPDATE_EXPENSE: 'expenseUpdated',
  DELETE_EXPENSE: 'expenseDeleted',
} as const

export function ActivityLog() {
  const t = useTranslations('Activity')
  const {
    groupId,
    locale,
    activities,
    participantName,
    isPending,
    isEmpty,
    sentinelRef,
  } = useActivityLog()

  if (isPending) return null

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-body-md text-muted-foreground">{t('noActivity')}</p>
        ) : (
          <ul className="flex flex-col">
            {activities.map((activity) => {
              const actor = participantName(activity.participantId) ?? t('someone')
              const body = t.rich(MESSAGE_KEYS[activity.activityType], {
                strong: (chunks) => <strong>{chunks}</strong>,
                em: (chunks) => <em>{chunks}</em>,
                participant: actor,
                expense: activity.data ?? '',
              })

              return (
                <li
                  key={activity.id}
                  className="flex flex-col gap-0.5 border-b border-border py-3 last:border-b-0"
                >
                  <span className="text-body-md text-foreground">
                    {activity.expenseId &&
                    activity.activityType !== 'DELETE_EXPENSE' ? (
                      <Link
                        href={`/groups/${groupId}/expenses/${activity.expenseId}/edit`}
                      >
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    {formatDateOnly(activity.time, locale, {
                      dateStyle: 'medium',
                    })}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </CardContent>
    </Card>
  )
}
