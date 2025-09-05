'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { useTranslations } from 'next-intl'

type TotalsCardProps = {
  totalGroupSpendings: number
  totalParticipantSpendings?: number
  totalParticipantShare?: number
  currency: Currency
  locale: Locale
}

function Total({
  label,
  amount,
  currency,
  locale,
  tone,
}: {
  label: string
  amount: number
  currency: Currency
  locale: Locale
  tone?: 'credit' | 'debit'
}) {
  return (
    <div className="flex flex-col">
      <span className="text-label-md text-muted-foreground">{label}</span>
      <span className="text-numeric-table-lg">
        <Money
          amount={Math.abs(amount)}
          currency={currency}
          locale={locale}
          tone={tone}
        />
      </span>
    </div>
  )
}

export function TotalsCard({
  totalGroupSpendings,
  totalParticipantSpendings,
  totalParticipantShare,
  currency,
  locale,
}: TotalsCardProps) {
  const t = useTranslations('Stats.Totals')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <Total
          label={t(
            totalGroupSpendings < 0 ? 'groupEarnings' : 'groupSpendings',
          )}
          amount={totalGroupSpendings}
          currency={currency}
          locale={locale}
        />
        {totalParticipantSpendings !== undefined && (
          <Total
            label={t(
              totalParticipantSpendings < 0 ? 'yourEarnings' : 'yourSpendings',
            )}
            amount={totalParticipantSpendings}
            currency={currency}
            locale={locale}
            tone={totalParticipantSpendings < 0 ? 'credit' : 'debit'}
          />
        )}
        {totalParticipantShare !== undefined && (
          <Total
            label={t('yourShare')}
            amount={totalParticipantShare}
            currency={currency}
            locale={locale}
            tone={totalParticipantShare < 0 ? 'credit' : 'debit'}
          />
        )}
      </CardContent>
    </Card>
  )
}
