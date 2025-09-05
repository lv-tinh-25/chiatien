'use client'

import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ReimbursementRowProps = {
  from: string
  to: string
  amount: number
  currency: Currency
  locale: Locale
  onSettle: () => void
}

export function ReimbursementRow({
  from,
  to,
  amount,
  currency,
  locale,
  onSettle,
}: ReimbursementRowProps) {
  const t = useTranslations('Balances.Reimbursements')

  return (
    <li
      data-testid="reimbursement-row"
      data-from={from}
      data-to={to}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2"
    >
      <span className="flex flex-1 items-center gap-2 text-body-lg text-foreground">
        <strong>{from}</strong>
        <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
        <strong>{to}</strong>
      </span>
      <Money
        amount={amount}
        currency={currency}
        locale={locale}
        className="text-numeric-table-md"
      />
      <button
        type="button"
        onClick={onSettle}
        className="min-h-touch-min rounded-control border border-credit/25 bg-credit/10 px-3 text-label-md text-credit"
      >
        {t('markAsPaid')}
      </button>
    </li>
  )
}
