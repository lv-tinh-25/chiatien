'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Money } from '@/components/core/atoms/Money'
import { DivergingBar } from '@/components/core/molecules/DivergingBar'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'

type BalanceRowProps = {
  name: string
  /** How the name reads once the viewer has said which participant they are. */
  label: string
  peers: readonly string[]
  total: number
  currency: Currency
  locale: Locale
  /** Widest absolute balance in the group, used to scale the bar. */
  scale: number
}

export function BalanceRow({
  name,
  label,
  peers,
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
      className="flex flex-col gap-1.5 py-2 lg:py-2.5"
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={name} peers={peers} size="sm" />
        <span className="min-w-0 flex-1 truncate text-headline-sm font-bold text-foreground">
          {label}
        </span>
        <Money
          amount={total}
          currency={currency}
          locale={locale}
          tone={credit ? 'credit' : 'debit'}
          sign="always"
          className="text-numeric-table-lg"
        />
      </div>

      <DivergingBar total={total} scale={scale} />
    </li>
  )
}
