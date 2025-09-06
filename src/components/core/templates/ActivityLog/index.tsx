'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Card } from '@/components/core/atoms/Card'
import { useActivityLog } from '@/hooks/activities/useActivityLog'
import type { ActivityDateGroup } from '@/lib/activity-groups'
import { cn, formatDate } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const MESSAGE_KEYS = {
  UPDATE_GROUP: 'settingsModified',
  CREATE_EXPENSE: 'expenseCreated',
  UPDATE_EXPENSE: 'expenseUpdated',
  DELETE_EXPENSE: 'expenseDeleted',
} as const

const TAG_TONES = {
  UPDATE_GROUP: 'bg-muted text-muted-foreground',
  CREATE_EXPENSE: 'bg-credit-subtle text-credit',
  UPDATE_EXPENSE: 'bg-secondary/12 text-secondary',
  DELETE_EXPENSE: 'bg-debit-subtle text-debit',
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
    <div className="flex w-full max-w-190 flex-col gap-4">
      <h1 className="hidden text-headline-lg text-foreground lg:block">
        {t('title')}
      </h1>

      {isEmpty && (
        <p className="text-body-md text-muted-foreground">{t('noActivity')}</p>
      )}

      {sections.map(({ group, activities }) => {
        const peers = activities.flatMap(({ participantId }) => {
          const name = participantName(participantId)
          return name === null ? [] : [name]
        })
        // "Today" and "Yesterday" each name one day, so the design spells that
        // day out beside them; the wider buckets have no single date to give.
        const heading = showsDate(group)
          ? t(`Groups.${group}`)
          : `${t(`Groups.${group}`)} · ${formatDate(activities[0].time, locale, { dateStyle: 'medium' })}`
        return (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="px-1 text-label-sm tracking-wide text-muted-foreground uppercase">
              {heading}
            </h2>
            <Card className="overflow-hidden">
              {activities.map((activity) => {
                const actor = participantName(activity.participantId)
                const body = t.rich(MESSAGE_KEYS[activity.activityType], {
                  strong: (chunks) => (
                    <strong className="font-bold">{chunks}</strong>
                  ),
                  em: (chunks) => (
                    <em className="font-bold text-primary-ink not-italic">
                      {chunks}
                    </em>
                  ),
                  participant: actor ?? t('someone'),
                  expense: activity.data ?? '',
                })
                const linked =
                  activity.expenseId !== null &&
                  activity.activityType !== 'DELETE_EXPENSE'

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 px-3.5 py-3 lg:px-4.5"
                  >
                    <Avatar
                      name={actor ?? t('someone')}
                      peers={peers}
                      size="lg"
                    />
                    <span className="min-w-0 flex-1 text-body-md text-foreground">
                      {linked ? (
                        <Link
                          href={`/groups/${groupId}/expenses/${activity.expenseId}/edit`}
                          className="hover:underline"
                        >
                          {body}
                        </Link>
                      ) : (
                        body
                      )}
                    </span>
                    <span className="shrink-0 text-body-sm text-muted-foreground tabular">
                      {formatDate(activity.time, locale, {
                        dateStyle: showsDate(group) ? 'medium' : undefined,
                        timeStyle: 'short',
                      })}
                    </span>
                    <span
                      className={cn(
                        'hidden shrink-0 rounded-full px-2.5 py-1 text-label-sm font-bold sm:inline',
                        TAG_TONES[activity.activityType],
                      )}
                    >
                      {t(`Tags.${activity.activityType}`)}
                    </span>
                  </div>
                )
              })}
            </Card>
          </section>
        )
      })}

      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  )
}
