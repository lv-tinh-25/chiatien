'use client'

import { Button } from '@/components/core/atoms/Button'
import { AmountInput } from '@/components/core/molecules/AmountInput'
import { FormField } from '@/components/core/molecules/FormField'
import { FormInput } from '@/components/core/molecules/FormInput'
import { useFormErrors } from '@/hooks/forms/useFormErrors'
import type { ConversionRateNotice } from '@/lib/conversion-rate-notice'
import type { Currency } from '@/lib/currency'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RefreshCw } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  originalCurrency: Currency
  conversionRequired: boolean
  usingCustomRate: boolean
  notice: ConversionRateNotice
  isLoadingRate: boolean
  onUseCustomRate: (custom: boolean) => void
  onRefreshRate: () => void
}

export function ExpenseCurrencyBlock({
  form,
  originalCurrency,
  conversionRequired,
  usingCustomRate,
  notice,
  isLoadingRate,
  onUseCustomRate,
  onRefreshRate,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const tRate = useTranslations('ExpenseForm.conversionRateState')
  const errors = useFormErrors(form.control)
  const locale = useLocale()
  const isReimbursement = useWatch({
    control: form.control,
    name: 'isReimbursement',
  })

  if (!conversionRequired) return null

  return (
    <div className="flex flex-col gap-4">
      <FormField
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
        errorKey={errors.originalAmount?.message}
      >
        {({ id, describedBy }) => (
          <Controller
            control={form.control}
            name="originalAmount"
            render={({ field }) => (
              <AmountInput
                id={id}
                aria-describedby={describedBy}
                placeholder={originalCurrency.symbol_native}
                // On a repayment this field is derived from the balance being
                // settled, so typing into it would be overwritten on the next
                // render.
                readOnly={Boolean(isReimbursement)}
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
            errorKey={errors.conversionRate?.message}
            {...form.register('conversionRate')}
          />
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}
