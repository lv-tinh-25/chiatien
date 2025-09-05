'use client'

import { FormInput } from '@/components/core/molecules/FormInput'
import type { Currency } from '@/lib/currency'
import { enforceCurrencyPattern } from '@/lib/currency-input'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  currency: Currency
}

export function ExpenseAmountField({ form, currency }: Props) {
  const t = useTranslations('ExpenseForm')
  const registration = form.register('amount')

  return (
    <FormInput
      label={t('amountField.label')}
      inputMode="decimal"
      placeholder={currency.symbol_native}
      errorKey={form.formState.errors.amount?.message}
      {...registration}
      onChange={(event) => {
        event.target.value = enforceCurrencyPattern(event.target.value)
        void registration.onChange(event)
      }}
    />
  )
}
