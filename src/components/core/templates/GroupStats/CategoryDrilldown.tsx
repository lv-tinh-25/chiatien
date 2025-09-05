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
  categoryId: number
  categoryLabel: string
  range: StatsRange
  currency: Currency
  locale: Locale
  trigger: ReactNode
}

export function CategoryDrilldown({
  groupId,
  categoryId,
  categoryLabel,
  range,
  currency,
  locale,
  trigger,
}: Props) {
  const t = useTranslations('Stats.ByCategory')
  const [open, setOpen] = useState(false)

  // Loaded only once the dialog is opened, so the stats page itself stays a
  // single request.
  const { data } = trpc.groups.stats.categoryExpenses.useQuery(
    { groupId, categoryId, from: range.from, to: range.to },
    { enabled: open },
  )

  return (
    <ExpensesDialog
      trigger={trigger}
      title={categoryLabel}
      description={t('detailsDescription')}
      emptyLabel={t('detailsEmpty')}
      expenses={data?.expenses ?? []}
      currency={currency}
      locale={locale}
      onOpenChange={setOpen}
    />
  )
}
