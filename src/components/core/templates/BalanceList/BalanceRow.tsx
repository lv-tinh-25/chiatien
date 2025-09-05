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

/**
 * The bar diverges from a centre axis rather than filling from the left, so
 * being owed and owing are told apart by direction as well as by colour — the
 * only encoding a red/green-blind viewer can still read.
 */
export function BalanceRow({
  name,
  total,
  currency,
  locale,
  scale,
}: BalanceRowProps) {
  const share = scale === 0 ? 0 : Math.abs(total) / scale
  const credit = total >= 0
  const width = `${(share * 50).toFixed(2)}%`

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

      <div className="relative h-2 rounded-full bg-foreground/8">
        <span
          aria-hidden
          className="absolute inset-y-[-2px] left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-foreground/25"
        />
        <span
          aria-hidden
          className={
            credit
              ? 'absolute inset-y-0 left-1/2 rounded-r-full bg-credit'
              : 'absolute inset-y-0 right-1/2 rounded-l-full bg-debit'
          }
          style={{ width }}
        />
      </div>
    </li>
  )
}
