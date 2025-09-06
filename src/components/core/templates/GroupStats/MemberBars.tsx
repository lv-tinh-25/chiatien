'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { participantTone } from '@/components/core/atoms/Avatar/tone'
import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import type { ParticipantSpending } from '@/lib/totals'
import { cn, formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type Props = {
  participants: ParticipantSpending[]
  currency: Currency
  locale: Locale
}

/**
 * The same four figures the table carried — who, how much, how many, what they
 * owe — read as a distribution instead of a grid, which is what the design
 * asks for and what the numbers are actually for.
 */
export function MemberBars({ participants, currency, locale }: Props) {
  const t = useTranslations('Stats.ByParticipant')
  const peers = participants.map((participant) => participant.name)
  const widest = Math.max(0, ...participants.map((row) => Math.abs(row.paid)))

  return (
    <ul className="grid gap-x-7 lg:grid-cols-2">
      {participants.map((participant) => {
        const tone = participantTone(participant.name)
        return (
          <li
            key={participant.participantId}
            className="flex items-center gap-2.5 py-1.5"
          >
            <Avatar name={participant.name} peers={peers} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-label-md">
                <span className="truncate text-foreground">
                  {participant.name}
                </span>
                <Money
                  amount={participant.paid}
                  currency={currency}
                  locale={locale}
                  className="shrink-0 text-muted-foreground"
                />
              </div>
              <span className="mt-1 block h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn('block h-full rounded-full', tone.fill)}
                  style={{
                    width: `${widest === 0 ? 0 : Math.round((Math.abs(participant.paid) / widest) * 100)}%`,
                  }}
                />
              </span>
              <span className="mt-0.5 hidden truncate text-body-sm text-muted-foreground lg:block">
                {t('meta', {
                  count: participant.paidCount,
                  share: formatCurrency(currency, participant.share, locale),
                })}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
