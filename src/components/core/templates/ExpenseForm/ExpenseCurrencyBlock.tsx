'use client'

import { Button } from '@/components/core/atoms/Button'
import { Input } from '@/components/core/atoms/Input'
import { CurrencySelect } from '@/components/core/molecules/CurrencySelect'
import { FormField } from '@/components/core/molecules/FormField'
import { FormInput } from '@/components/core/molecules/FormInput'
import type { Locale } from '@/i18n/locales'
import type { ConversionRateNotice } from '@/lib/conversion-rate-notice'
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
  notice: ConversionRateNotice
  isLoadingRate: boolean
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
  notice,
  isLoadingRate,
  onUseCustomRate,
  onRefreshRate,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const tRate = useTranslations('ExpenseForm.conversionRateState')
  const scope = isIncome ? 'Income' : 'Expense'
  const currencyCode = useWatch({ control: form.control, name: 'originalCurrency' })
  const isReimbursement = useWatch({
    control: form.control,
    name: 'isReimbursement',
  })
  const originalAmount = form.register('originalAmount')

  // A group on a custom currency has no ISO code, so there is no rate to look
  // up and nothing to convert into.
  const groupHasCode = groupCurrency.code !== ''

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label={t(`${scope}.currencyField.label`)}
        description={`${t(`${scope}.currencyField.description`)}${
          groupHasCode ? '' : ` ${t('conversionUnavailable')}`
        }`}
        errorKey={form.formState.errors.originalCurrency?.message}
      >
        {({ id, describedBy }) =>
          groupHasCode ? (
            <CurrencySelect
              id={id}
              aria-describedby={describedBy}
              locale={locale}
              value={currencyCode ?? ''}
              onValueChange={(value) =>
                form.setValue('originalCurrency', value, { shouldDirty: true })
              }
            />
          ) : (
            <Input
              id={id}
              aria-describedby={describedBy}
              disabled
              value={groupCurrency.symbol_native}
              readOnly
            />
          )
        }
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

          <p className="flex flex-wrap items-center gap-x-2 text-body-sm text-muted-foreground">
            <span>
              {notice.messages
                .map((message) => tRate(message.key, message.values))
                .join(' ')}
            </span>
            {notice.display !== null && <span>{notice.display}</span>}
            {!isLoadingRate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={tRate('refresh')}
                onClick={() => {
                  onUseCustomRate(false)
                  onRefreshRate()
                }}
              >
                <RefreshCw aria-hidden />
              </Button>
            )}
          </p>

          <Collapsible.Root
            open={usingCustomRate}
            onOpenChange={(open) => onUseCustomRate(open)}
          >
            <Collapsible.Trigger asChild>
              <Button type="button" variant="ghost" className="px-0">
                {t(
                  usingCustomRate
                    ? 'conversionRateField.useApi'
                    : 'conversionRateField.useCustom',
                )}
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content className="pt-2">
              <FormInput
                label={t('conversionRateField.label')}
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
