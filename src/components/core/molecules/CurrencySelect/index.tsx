'use client'

import { Select } from '@/components/core/molecules/Select'
import type { Locale } from '@/i18n/locales'
import { defaultCurrencyList } from '@/lib/currency'
import { useMemo } from 'react'

type CurrencySelectProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  locale: Locale
  placeholder?: string
  'aria-describedby'?: string
}

export function CurrencySelect({
  id,
  value,
  onValueChange,
  locale,
  placeholder,
  ...aria
}: CurrencySelectProps) {
  const options = useMemo(
    () =>
      defaultCurrencyList(locale).map((currency) => ({
        value: currency.code,
        label: `${currency.name} (${currency.symbol_native})`,
      })),
    [locale],
  )

  return (
    <Select
      id={id}
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
      aria-describedby={aria['aria-describedby']}
    />
  )
}
