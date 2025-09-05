'use client'

import { Button } from '@/components/core/atoms/Button'
import { CurrencySelect } from '@/components/core/molecules/CurrencySelect'
import { FormField } from '@/components/core/molecules/FormField'
import { FormInput } from '@/components/core/molecules/FormInput'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { enforceCurrencyPattern } from '@/lib/currency-input'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useWatch, type UseFormReturn } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  locale: Locale
  groupCurrency: Currency
  originalCurrency: Currency
  isIncome: boolean
  conversionRequired: boolean
  usingCustomRate: boolean
  onUseCustomRate: (custom: boolean) => void
  onRefreshRate: () => void
}

export function ExpenseCurrencyBlock({
  form,
  locale,
  groupCurrency,
  originalCurrency,
  isIncome,
  conversionRequired,
  usingCustomRate,
  onUseCustomRate,
  onRefreshRate,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const scope = isIncome ? 'Income' : 'Expense'
  const currencyCode = useWatch({ control: form.control, name: 'originalCurrency' })
  const isReimbursement = useWatch({
    control: form.control,
    name: 'isReimbursement',
  })
  const rate = useWatch({ control: form.control, name: 'conversionRate' })
  const originalAmount = form.register('originalAmount')

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label={t(`${scope}.currencyField.label`)}
        description={t(`${scope}.currencyField.description`)}
        errorKey={form.formState.errors.originalCurrency?.message}
      >
        {({ id, describedBy }) => (
          <CurrencySelect
            id={id}
            aria-describedby={describedBy}
            locale={locale}
            value={currencyCode ?? ''}
            onValueChange={(value) =>
              form.setValue('originalCurrency', value, { shouldDirty: true })
            }
          />
        )}
      </FormField>

      {conversionRequired && (
        <>
          <FormInput
            label={
              isReimbursement
                ? t('originalAmountField.repaymentLabel')
                : t('amountField.label')
            }
            description={
              isReimbursement
                ? t('originalAmountField.repaymentDescription')
                : undefined
            }
            inputMode="decimal"
            placeholder={originalCurrency.symbol_native}
            // On a repayment this field is derived from the balance being
            // settled, so typing into it would be overwritten on the next
            // render.
            readOnly={Boolean(isReimbursement)}
            errorKey={form.formState.errors.originalAmount?.message}
            {...originalAmount}
            onChange={(event) => {
              event.target.value = enforceCurrencyPattern(event.target.value)
              void originalAmount.onChange(event)
            }}
          />

          {/* A formula, not prose: only codes and a number, so nothing to translate. */}
          <p className="flex items-center gap-2 text-body-sm text-muted-foreground">
            <span>
              {originalCurrency.code} 1 = {groupCurrency.code} {String(rate ?? '')}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t('conversionRateState.refresh')}
              onClick={() => {
                onUseCustomRate(false)
                onRefreshRate()
              }}
            >
              <RefreshCw aria-hidden />
            </Button>
          </p>

          <Collapsible.Root
            open={usingCustomRate}
            onOpenChange={(open) => onUseCustomRate(open)}
          >
            <Collapsible.Trigger asChild>
              <Button type="button" variant="ghost" className="px-0">
                {t('conversionRateState.useCustomRate')}
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content className="pt-2">
              <FormInput
                label={t('conversionRateState.customRate')}
                inputMode="decimal"
                errorKey={form.formState.errors.conversionRate?.message}
                {...form.register('conversionRate')}
              />
            </Collapsible.Content>
          </Collapsible.Root>
        </>
      )}
    </div>
  )
}
