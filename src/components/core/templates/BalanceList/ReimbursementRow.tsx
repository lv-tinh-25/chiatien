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
  peers: readonly string[]
  amount: number
  currency: Currency
  locale: Locale
  settleHref: string
}

export function ReimbursementRow({
  fromName,
  toName,
  peers,
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
      className="glass-raised flex items-center gap-2.5 rounded-card p-3.5 lg:gap-3 lg:px-4"
    >
      <span aria-hidden className="flex shrink-0 items-center gap-1">
        <Avatar name={fromName} peers={peers} size="lg" />
        <ArrowRight className="size-3.5 text-muted-foreground-subtle" />
        <Avatar name={toName} peers={peers} size="lg" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-headline-sm font-bold text-foreground">
          {t('row', { from: fromName, to: toName })}
        </span>
        <Money
          amount={amount}
          currency={currency}
          locale={locale}
          tone="credit"
          className="block text-numeric-table-lg"
        />
      </span>

      <Button variant="settle" size="sm" className="shrink-0" asChild>
        <Link href={settleHref}>
          <span className="lg:hidden">{t('markAsPaidShort')}</span>
          <span className="hidden lg:inline">{t('markAsPaid')}</span>
        </Link>
      </Button>
    </li>
  )
}
