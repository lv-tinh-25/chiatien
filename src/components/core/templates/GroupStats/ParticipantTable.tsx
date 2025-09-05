'use client'

import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import type { ParticipantSpending } from '@/lib/totals'
import { useTranslations } from 'next-intl'

type Props = {
  participants: ParticipantSpending[]
  currency: Currency
  locale: Locale
}

export function ParticipantTable({ participants, currency, locale }: Props) {
  const t = useTranslations('Stats.ByParticipant')

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-md">
        <thead>
          <tr className="border-b border-border text-label-md text-muted-foreground">
            <th className="py-2 pr-2 text-left font-normal">
              {t('participant')}
            </th>
            <th className="px-2 py-2 text-right font-normal">{t('paid')}</th>
            <th className="px-2 py-2 text-right font-normal">{t('count')}</th>
            <th className="py-2 pl-2 text-right font-normal">{t('share')}</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr
              key={participant.participantId}
              className="border-b border-border last:border-b-0"
            >
              <td className="py-2 pr-2 text-foreground">{participant.name}</td>
              <td className="px-2 py-2 text-right">
                <Money
                  amount={participant.paid}
                  currency={currency}
                  locale={locale}
                />
              </td>
              <td className="px-2 py-2 text-right tabular text-muted-foreground">
                {participant.paidCount}
              </td>
              <td className="py-2 pl-2 text-right text-muted-foreground">
                <Money
                  amount={participant.share}
                  currency={currency}
                  locale={locale}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
