'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { useTranslations } from 'next-intl'

type TotalsCardProps = {
  rangeCaption: string
  totalGroupSpendings: number
  totalParticipantSpendings?: number
  totalParticipantShare?: number
  currency: Currency
  locale: Locale
  className?: string
}

function Metric({
  label,
  amount,
  currency,
  locale,
  tone,
  sign,
}: {
  label: string
  amount: number
  currency: Currency
  locale: Locale
  tone?: 'credit' | 'debit'
  sign?: 'auto' | 'always'
}) {
  return (
    <span className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground">{label}</span>
      <Money
        amount={amount}
        currency={currency}
        locale={locale}
        tone={tone}
        sign={sign}
        className="font-extrabold"
      />
    </span>
  )
}

export function TotalsCard({
  rangeCaption,
  totalGroupSpendings,
  totalParticipantSpendings,
  totalParticipantShare,
  currency,
  locale,
  className,
}: TotalsCardProps) {
  const t = useTranslations('Stats.Totals')
  const personalised =
    totalParticipantSpendings !== undefined &&
    totalParticipantShare !== undefined

  return (
    <Card className={className}>
      {/* The heading stays a real heading inside a header: `cardByTitle` finds
          this card by walking up two levels from it. */}
      <CardHeader className="flex-row items-baseline gap-1.5 pb-1">
        <CardTitle className="text-label-md text-muted-foreground">
          {t('title')}
        </CardTitle>
        <span className="text-label-md text-muted-foreground">
          · {rangeCaption}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0">
        <span className="text-display-currency text-foreground">
          <Money
            amount={Math.abs(totalGroupSpendings)}
            currency={currency}
            locale={locale}
          />
        </span>

        {personalised && (
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-body-md font-semibold">
            <Metric
              label={t(
                totalParticipantSpendings < 0
                  ? 'yourEarnings'
                  : 'yourSpendings',
              )}
              amount={Math.abs(totalParticipantSpendings)}
              currency={currency}
              locale={locale}
            />
            <Metric
              label={t('yourShare')}
              amount={Math.abs(totalParticipantShare)}
              currency={currency}
              locale={locale}
            />
            {/* What the viewer would get back or still owe if the group
                settled at this instant — the reading the other two exist for. */}
            <Metric
              label={t('difference')}
              amount={totalParticipantSpendings - totalParticipantShare}
              currency={currency}
              locale={locale}
              tone={
                totalParticipantSpendings - totalParticipantShare >= 0
                  ? 'credit'
                  : 'debit'
              }
              sign="always"
            />
          </div>
        )}

        <span className="text-label-md text-muted-foreground">
          {t(totalGroupSpendings < 0 ? 'groupEarnings' : 'groupSpendings')}
        </span>
      </CardContent>
    </Card>
  )
}
