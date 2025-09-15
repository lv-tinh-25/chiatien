'use client'

import { Input } from '@/components/core/atoms/Input'
import { AmountInput } from '@/components/core/molecules/AmountInput'
import type { SplitMode } from '@/generated/prisma/browser'
import type { Currency } from '@/lib/currency'
import { enforceCurrencyPattern } from '@/lib/currency-input'
import { useTranslations } from 'next-intl'
import { match } from 'ts-pattern'

type ShareInputProps = {
  splitMode: SplitMode
  currency: Currency
  locale: string
  value: string
  participantName: string
  onChange: (value: string) => void
}

/**
 * One control for all three uneven modes. Only the adornment and the accepted
 * characters differ, so splitting it into three components would duplicate the
 * wiring without adding clarity.
 */
export function ShareInput({
  splitMode,
  currency,
  locale,
  value,
  participantName,
  onChange,
}: ShareInputProps) {
  const t = useTranslations('ExpenseForm')

  const adornment = match(splitMode)
    .with('BY_PERCENTAGE', () => '%')
    .with('BY_AMOUNT', () => currency.symbol_native)
    .with('BY_SHARES', () => t('shares'))
    .with('EVENLY', () => '')
    .exhaustive()

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {/* Only the amount is money. A share count and a percentage are small
          enough to read unaided, and grouping them would suggest otherwise. */}
      {splitMode === 'BY_AMOUNT' ? (
        <AmountInput
          aria-label={`${participantName} ${adornment}`.trim()}
          className="w-24 text-right lg:w-28"
          locale={locale}
          value={value}
          onValueChange={onChange}
        />
      ) : (
        <Input
          aria-label={`${participantName} ${adornment}`.trim()}
          inputMode="decimal"
          className="w-20 text-right lg:w-24"
          value={value}
          onChange={(event) =>
            onChange(enforceCurrencyPattern(event.target.value))
          }
        />
      )}
      {/* Sized by its own text, not a fixed box: a reserved width would either
          clip "share(s)" or leave the field floating away from the row edge. */}
      <span className="shrink-0 text-body-sm text-muted-foreground">
        {adornment}
      </span>
    </span>
  )
}
