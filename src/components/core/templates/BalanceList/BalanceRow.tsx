'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Money } from '@/components/core/atoms/Money'
import { DivergingBar } from '@/components/core/molecules/DivergingBar'
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
  const credit = total >= 0

  return (
    <li
      data-testid="balance-row"
      data-participant={name}
      className="flex flex-col gap-2 py-2.5"
    >
      <div className="flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <span className="min-w-0 flex-1 truncate text-body-lg text-foreground">
          {name}
        </span>
        <Money
          amount={total}
          currency={currency}
          locale={locale}
          tone={credit ? 'credit' : 'debit'}
          className="text-numeric-table-md"
        />
      </div>

      <DivergingBar total={total} scale={scale} />
    </li>
  )
}
