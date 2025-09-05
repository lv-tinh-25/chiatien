import type { Currency } from '@/lib/currency'
import { cn, formatCurrency } from '@/lib/utils'

type MoneyProps = {
  amount: number
  currency: Currency
  locale: string
  tone?: 'neutral' | 'credit' | 'debit'
  /** Set when `amount` is a decimal rather than the minor units used elsewhere. */
  fractions?: boolean
  className?: string
}

const TONES = {
  neutral: 'text-foreground',
  credit: 'text-credit',
  debit: 'text-debit',
}

/**
 * `tabular` is not decorative: without it the digit widths shift and money
 * columns jitter as a list scrolls.
 */
export function Money({
  amount,
  currency,
  locale,
  tone = 'neutral',
  fractions = false,
  className,
}: MoneyProps) {
  return (
    <span className={cn('tabular', TONES[tone], className)}>
      {formatCurrency(currency, amount, locale, fractions)}
    </span>
  )
}
