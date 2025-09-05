'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'

type BalanceRowProps = {
  name: string
  total: number
  currency: Currency
  locale: Locale
  /** Widest absolute balance in the group, used to scale the bar. */
  scale: number
}

export function BalanceRow({
  name,
  total,
  currency,
  locale,
  scale,
}: BalanceRowProps) {
  const share = scale === 0 ? 0 : Math.abs(total) / scale
  const credit = total >= 0

  return (
    <li
      data-testid="balance-row"
      data-participant={name}
      className="flex flex-col gap-1.5 py-2"
    >
      <div className="flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <span className="flex-1 text-body-lg text-foreground">{name}</span>
        <Money
          amount={total}
          currency={currency}
          locale={locale}
          tone={credit ? 'credit' : 'debit'}
          className="text-numeric-table-md"
        />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={credit ? 'h-full bg-credit' : 'h-full bg-debit'}
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </div>
    </li>
  )
}
