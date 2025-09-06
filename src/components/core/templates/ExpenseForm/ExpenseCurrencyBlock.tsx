'use client'

import { Button } from '@/components/core/atoms/Button'
import { FormInput } from '@/components/core/molecules/FormInput'
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
  const isReimbursement = useWatch({
    control: form.control,
    name: 'isReimbursement',
  })
  const originalAmount = form.register('originalAmount')

  if (!conversionRequired) return null

  return (
    <div className="flex flex-col gap-4">
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
        // On a repayment this field is derived from the balance being settled,
        // so typing into it would be overwritten on the next render.
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
    </div>
  )
}
