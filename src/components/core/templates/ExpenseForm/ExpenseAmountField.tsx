'use client'

import { AmountInput } from '@/components/core/molecules/AmountInput'
import { FormField } from '@/components/core/molecules/FormField'
import { useFormErrors } from '@/hooks/forms/useFormErrors'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  currency: Currency
  locale: Locale
}

/**
 * An expense is entered in the group's own currency and in no other, so there
 * is one field and no unit to pick: the number typed here is the number that
 * settles the balance.
 */
export function ExpenseAmountField({ form, currency, locale }: Props) {
  const t = useTranslations('ExpenseForm')
  const errors = useFormErrors(form.control)

  return (
    <FormField label={t('amountField.label')} errorKey={errors.amount?.message}>
      {({ id, describedBy }) => (
        <Controller
          control={form.control}
          name="amount"
          render={({ field }) => (
            <AmountInput
              id={id}
              aria-describedby={describedBy}
              placeholder={currency.symbol_native}
              className="h-13 text-[1.5rem] font-extrabold tracking-[-0.02em] lg:text-[1.625rem]"
              locale={locale}
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
            />
          )}
        />
      )}
    </FormField>
  )
}
