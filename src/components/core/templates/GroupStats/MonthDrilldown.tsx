'use client'

import { ExpensesDialog } from '@/components/core/templates/GroupStats/ExpensesDialog'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import type { StatsRange } from '@/lib/stats-range'
import { trpc } from '@/trpc/client'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

type Props = {
  groupId: string
  month: string
  monthLabel: string
  range: StatsRange
  currency: Currency
  locale: Locale
  trigger: ReactNode
}

export function MonthDrilldown({
  groupId,
  month,
  monthLabel,
  range,
  currency,
  locale,
  trigger,
}: Props) {
  const t = useTranslations('Stats.OverTime')
  const [open, setOpen] = useState(false)

  const { data } = trpc.groups.stats.monthExpenses.useQuery(
    { groupId, month, from: range.from, to: range.to },
    { enabled: open },
  )

  return (
    <ExpensesDialog
      trigger={trigger}
      title={monthLabel}
      description={t('detailsDescription')}
      emptyLabel={t('detailsEmpty')}
      expenses={data?.expenses ?? []}
      currency={currency}
      locale={locale}
      onOpenChange={setOpen}
    />
  )
}
