'use client'

import { Input } from '@/components/core/atoms/Input'
import { CurrencyChips } from '@/components/core/molecules/CurrencyChips'
import { FormField } from '@/components/core/molecules/FormField'
import { useFormErrors } from '@/hooks/forms/useFormErrors'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { currencyChoicesWith } from '@/lib/currency-choices'
import { enforceCurrencyPattern } from '@/lib/currency-input'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  currency: Currency
  locale: Locale
  /** A group on a custom currency has no ISO code, so nothing can convert. */
  convertible: boolean
}

/**
 * The design puts the currency beside the amount rather than in a field of its
 * own: the two are one decision, and the amount is the largest number on the
 * screen.
 */
export function ExpenseAmountField({
  form,
  currency,
  locale,
  convertible,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const errors = useFormErrors(form.control)
  const registration = form.register('amount')
  const currencyCode = useWatch({
    control: form.control,
    name: 'originalCurrency',
  })
  // An expense created before a currency was ever chosen stores an empty
  // string, which means "the group's own".
  const selected = String(currencyCode || currency.code)
  const options = currencyChoicesWith(locale, selected)

  return (
    <FormField label={t('amountField.label')} errorKey={errors.amount?.message}>
      {({ id, describedBy }) => (
        <div className="flex items-stretch gap-2">
          <Input
            id={id}
            aria-describedby={describedBy}
            inputMode="decimal"
            placeholder={currency.symbol_native}
            className="h-13 flex-1 text-[1.5rem] font-extrabold tracking-[-0.02em] lg:text-[1.625rem]"
            {...registration}
            onChange={(event) => {
              event.target.value = enforceCurrencyPattern(event.target.value)
              void registration.onChange(event)
            }}
          />
          {convertible && (
            <CurrencyChips
              value={selected}
              options={options}
              onValueChange={(code) =>
                form.setValue('originalCurrency', code, { shouldDirty: true })
              }
              label={t('Expense.currencyField.label')}
            />
          )}
        </div>
      )}
    </FormField>
  )
}
