'use client'

import { Input } from '@/components/core/atoms/Input'
import type { SplitMode } from '@/generated/prisma/browser'
import type { Currency } from '@/lib/currency'
import { enforceCurrencyPattern } from '@/lib/currency-input'
import { useTranslations } from 'next-intl'
import { match } from 'ts-pattern'

type ShareInputProps = {
  splitMode: SplitMode
  currency: Currency
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
    <span className="flex items-center gap-1">
      <Input
        aria-label={`${participantName} ${adornment}`.trim()}
        inputMode="decimal"
        className="w-24 text-right"
        value={value}
        onChange={(event) =>
          onChange(enforceCurrencyPattern(event.target.value))
        }
      />
      <span className="w-10 shrink-0 text-body-sm text-muted-foreground">
        {adornment}
      </span>
    </span>
  )
}
