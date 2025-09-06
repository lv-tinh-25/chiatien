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
  className?: string
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
      <span className="text-numeric-table-md font-bold">
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
  className,
}: TotalsCardProps) {
  const t = useTranslations('Stats.Totals')

  return (
    <Card className={className}>
      <CardHeader className="gap-0 pb-2">
        <CardTitle className="text-label-md font-bold text-muted-foreground">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex flex-col">
          <span className="text-display-currency font-extrabold text-foreground">
            <Money
              amount={Math.abs(totalGroupSpendings)}
              currency={currency}
              locale={locale}
            />
          </span>
          <span className="text-body-sm text-muted-foreground">
            {t('description')}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-2">
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
        </div>
      </CardContent>
    </Card>
  )
}
