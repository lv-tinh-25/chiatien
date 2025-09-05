'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { useActivityLog } from '@/hooks/activities/useActivityLog'
import type { ActivityDateGroup } from '@/lib/activity-groups'
import { formatDate } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const MESSAGE_KEYS = {
  UPDATE_GROUP: 'settingsModified',
  CREATE_EXPENSE: 'expenseCreated',
  UPDATE_EXPENSE: 'expenseUpdated',
  DELETE_EXPENSE: 'expenseDeleted',
} as const

// Today's and yesterday's headings already say which day it was, so those rows
// carry a time only.
const showsDate = (group: ActivityDateGroup) =>
  group !== 'today' && group !== 'yesterday'

export function ActivityLog() {
  const t = useTranslations('Activity')
  const {
    groupId,
    locale,
    sections,
    participantName,
    isPending,
    isEmpty,
    sentinelRef,
  } = useActivityLog()

  if (isPending) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-body-md text-muted-foreground">
            {t('noActivity')}
          </p>
        ) : (
          sections.map(({ group, activities }) => (
            <section key={group} className="flex flex-col">
              <h3 className="flex items-center gap-3 pt-3 pb-2 text-label-sm tracking-wider text-muted-foreground uppercase">
                {t(`Groups.${group}`)}
                <span aria-hidden className="h-px flex-1 bg-border" />
              </h3>
              <ul className="mb-2 flex flex-col">
                {activities.map((activity) => {
                  const actor =
                    participantName(activity.participantId) ?? t('someone')
                  const body = t.rich(MESSAGE_KEYS[activity.activityType], {
                    strong: (chunks) => <strong>{chunks}</strong>,
                    em: (chunks) => <em>{chunks}</em>,
                    participant: actor,
                    expense: activity.data ?? '',
                  })

                  return (
                    <li
                      key={activity.id}
                      className="flex flex-col gap-0.5 border-b border-border/50 py-3 last:border-b-0"
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
                      <span className="text-body-sm text-muted-foreground tabular">
                        {formatDate(activity.time, locale, {
                          dateStyle: showsDate(group) ? 'medium' : undefined,
                          timeStyle: 'short',
                        })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </CardContent>
    </Card>
  )
}
