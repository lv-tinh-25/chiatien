'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Button } from '@/components/core/atoms/Button'
import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { ArrowRight } from 'lucide-react'
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
      className="glass-raised flex flex-col gap-2.5 rounded-card p-3.5 sm:flex-row sm:items-center sm:gap-3"
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <span aria-hidden className="flex shrink-0 items-center gap-1">
          <Avatar name={fromName} size="lg" />
          <ArrowRight className="size-3.5 text-muted-foreground" />
          <Avatar name={toName} size="lg" />
        </span>
        <span className="min-w-0 text-body-md text-foreground">
          {t.rich('owes', {
            strong: (chunks) => (
              <strong className="font-semibold">{chunks}</strong>
            ),
            from: fromName,
            to: toName,
          })}
        </span>
      </span>

      <span className="flex items-center justify-between gap-3 sm:justify-end">
        <Money
          amount={amount}
          currency={currency}
          locale={locale}
          className="text-numeric-table-md font-extrabold whitespace-nowrap"
        />

        <Button variant="settle" size="sm" asChild>
          <Link href={settleHref}>{t('markAsPaid')}</Link>
        </Button>
      </span>
    </li>
  )
}
