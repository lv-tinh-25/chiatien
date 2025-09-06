import type { Currency } from '@/lib/currency'
import { cn, formatCurrency } from '@/lib/utils'

/**
 * What the viewer stands to receive or owe, in one pill. The sign is spelled
 * out with a leading + or − so the state is readable without the colour.
 */
export function BalanceChip({
  amount,
  currency,
  locale,
  settledLabel,
  className,
}: {
  amount: number
  currency: Currency
  locale: string
  settledLabel: string
  className?: string
}) {
  const settled = amount === 0
  const sign = amount > 0 ? '+' : '−'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-label-md font-bold whitespace-nowrap tabular',
        settled && 'bg-muted text-muted-foreground',
        amount > 0 && 'bg-credit-subtle text-credit',
        amount < 0 && 'bg-debit-subtle text-debit',
        className,
      )}
    >
      {settled
        ? settledLabel
        : `${sign}${formatCurrency(currency, Math.abs(amount), locale)}`}
    </span>
  )
}
