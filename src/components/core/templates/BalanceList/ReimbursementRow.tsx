'use client'

import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type ReimbursementRowProps = {
  fromId: string
  toId: string
  fromName: string
  toName: string
  amount: number
  currency: Currency
  locale: Locale
  settleHref: string
}

export function ReimbursementRow({
  fromName,
  toName,
  amount,
  currency,
  locale,
  settleHref,
}: ReimbursementRowProps) {
  const t = useTranslations('Balances.Reimbursements')

  return (
    <li
      data-testid="reimbursement-row"
      data-from={fromName}
      data-to={toName}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2"
    >
      <span className="flex-1 text-body-lg text-foreground">
        {t.rich('owes', {
          strong: (chunks) => <strong>{chunks}</strong>,
          from: fromName,
          to: toName,
        })}
      </span>
      <Money
        amount={amount}
        currency={currency}
        locale={locale}
        className="text-numeric-table-md"
      />
      <Link
        href={settleHref}
        className="flex min-h-touch-min items-center rounded-control border border-credit/25 bg-credit/10 px-3 text-label-md text-credit"
      >
        {t('markAsPaid')}
      </Link>
    </li>
  )
}
