'use client'

import { Card } from '@/components/core/atoms/Card'
import { Checkbox } from '@/components/core/atoms/Checkbox'
import { ExpenseAmountField } from '@/components/core/templates/ExpenseForm/ExpenseAmountField'
import { ExpenseCurrencyBlock } from '@/components/core/templates/ExpenseForm/ExpenseCurrencyBlock'
import { ExpenseDocumentsField } from '@/components/core/templates/ExpenseForm/ExpenseDocumentsField'
import { ExpenseFormFooter } from '@/components/core/templates/ExpenseForm/ExpenseFormFooter'
import { ExpenseMetaFields } from '@/components/core/templates/ExpenseForm/ExpenseMetaFields'
import { ExpenseRecurrenceField } from '@/components/core/templates/ExpenseForm/ExpenseRecurrenceField'
import { ExpenseTitleField } from '@/components/core/templates/ExpenseForm/ExpenseTitleField'
import { PaidForList } from '@/components/core/templates/ExpenseForm/PaidForList'
import { useExpenseForm } from '@/hooks/expenses/useExpenseForm'
import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import type { AppRouterOutput } from '@/trpc/routers/_app'
import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'

type Expense = AppRouterOutput['groups']['expenses']['get']['expense']

type ExpenseFormProps = {
  expense?: Expense
  categoryExtractEnabled: boolean
  documentsEnabled: boolean
}

/**
 * Gate, not decoration: useExpenseForm builds its default values from the
 * group's participants, and react-hook-form keeps whatever defaults it was
 * given on first render. Mounting the fields before the group has loaded
 * produces a form with no one to pay for and no one paying.
 */
export function ExpenseForm(props: ExpenseFormProps) {
  const { group } = useCurrentGroup()
  if (!group) return null
  return <ExpenseFormFields {...props} />
}

function ExpenseFormFields({
  expense,
  categoryExtractEnabled,
  documentsEnabled,
}: ExpenseFormProps) {
  const t = useTranslations('ExpenseForm')
  const {
    form,
    groupId,
    locale,
    groupCurrency,
    originalCurrency,
    participants,
    isCreate,
    submit,
    remove,
    markEdited,
    isSubmitting,
    conversionRequired,
    exchangeRate,
    usingCustomRate,
    setUsingCustomRate,
    notice,
  } = useExpenseForm(expense)

  const amount = useWatch({ control: form.control, name: 'amount' })
  const isReimbursement = useWatch({
    control: form.control,
    name: 'isReimbursement',
  })

  const isIncome = Number(amount) < 0
  const scope = isIncome ? 'Income' : 'Expense'

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4">
      <h1 className="hidden text-headline-lg font-extrabold text-foreground lg:block">
        {isCreate ? t(`${scope}.create`) : t(`${scope}.edit`)}
      </h1>

      <div className="grid items-start gap-4 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,22.5rem),1fr))]">
        <Card className="flex flex-col gap-4 p-4 lg:p-5">
          <ExpenseTitleField
            form={form}
            isIncome={isIncome}
            categoryExtractEnabled={categoryExtractEnabled}
          />
          <ExpenseAmountField form={form} currency={groupCurrency} />

          <ExpenseCurrencyBlock
            form={form}
            locale={locale}
            groupCurrency={groupCurrency}
            originalCurrency={originalCurrency}
            isIncome={isIncome}
            conversionRequired={conversionRequired}
            usingCustomRate={usingCustomRate}
            notice={notice}
            isLoadingRate={exchangeRate.isLoading}
            onUseCustomRate={setUsingCustomRate}
            onRefreshRate={() => void exchangeRate.refresh()}
          />

          <ExpenseRecurrenceField form={form} />

          <ExpenseMetaFields
            form={form}
            isIncome={isIncome}
            participants={participants}
          />

          <label className="flex min-h-touch-min items-center gap-3">
            <Checkbox
              checked={Boolean(isReimbursement)}
              onCheckedChange={(state) =>
                form.setValue('isReimbursement', state === true)
              }
            />
            <span className="text-body-md text-foreground">
              {t('isReimbursementField.label')}
            </span>
          </label>

          {documentsEnabled && (
            <ExpenseDocumentsField form={form} isIncome={isIncome} />
          )}
        </Card>

        <div className="flex flex-col gap-3.5">
          <PaidForList
            form={form}
            participants={participants}
            currency={groupCurrency}
            isIncome={isIncome}
            onShareEdited={markEdited}
          />

          <ExpenseFormFooter
            isCreate={isCreate}
            isSubmitting={isSubmitting}
            cancelHref={`/groups/${groupId}/expenses`}
            onDelete={() => void remove()}
          />
        </div>
      </div>
    </form>
  )
}
