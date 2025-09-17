'use client'

import { BackButton } from '@/components/core/atoms/BackButton'
import { Card } from '@/components/core/atoms/Card'
import { ExpenseAmountField } from '@/components/core/templates/ExpenseForm/ExpenseAmountField'
import { ExpenseCurrencyBlock } from '@/components/core/templates/ExpenseForm/ExpenseCurrencyBlock'
import { ExpenseDocumentsField } from '@/components/core/templates/ExpenseForm/ExpenseDocumentsField'
import { ExpenseFormFooter } from '@/components/core/templates/ExpenseForm/ExpenseFormFooter'
import { ExpenseMetaFields } from '@/components/core/templates/ExpenseForm/ExpenseMetaFields'
import { ExpenseTitleField } from '@/components/core/templates/ExpenseForm/ExpenseTitleField'
import { PaidForList } from '@/components/core/templates/ExpenseForm/PaidForList'
import { ExpenseFormSkeleton } from '@/components/core/templates/ExpenseForm/Skeleton'
import { useExpenseForm } from '@/hooks/expenses/useExpenseForm'
import { useParentPath } from '@/hooks/forms/useParentPath'
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
  if (!group) return <ExpenseFormSkeleton />
  return <ExpenseFormFields {...props} />
}

function ExpenseFormFields({
  expense,
  categoryExtractEnabled,
  documentsEnabled,
}: ExpenseFormProps) {
  const t = useTranslations('ExpenseForm')
  const back = useParentPath()
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
    canSubmit,
    conversionRequired,
    exchangeRate,
    usingCustomRate,
    setUsingCustomRate,
    notice,
  } = useExpenseForm(expense)

  const amount = useWatch({ control: form.control, name: 'amount' })

  const isIncome = Number(amount) < 0
  const scope = isIncome ? 'Income' : 'Expense'

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4">
      {/* The phone gets its back button from the shell header; the desktop
          header has no back affordance of its own, so the title carries one. */}
      <div className="hidden items-center gap-3 lg:flex">
        {back !== null && <BackButton href={back} />}
        <h1 className="text-headline-lg text-foreground">
          {isCreate ? t(`${scope}.create`) : t(`${scope}.edit`)}
        </h1>
      </div>

      <div className="grid items-start gap-4 *:min-w-0 md:grid-cols-[repeat(auto-fit,minmax(min(100%,22.5rem),1fr))]">
        <Card className="flex flex-col gap-3.5 p-4 lg:gap-4 lg:p-5">
          <ExpenseTitleField
            form={form}
            isIncome={isIncome}
            categoryExtractEnabled={categoryExtractEnabled}
          />
          <ExpenseAmountField
            form={form}
            currency={groupCurrency}
            locale={locale}
            convertible={groupCurrency.code !== ''}
          />

          <ExpenseCurrencyBlock
            form={form}
            originalCurrency={originalCurrency}
            conversionRequired={conversionRequired}
            usingCustomRate={usingCustomRate}
            notice={notice}
            isLoadingRate={exchangeRate.isLoading}
            onUseCustomRate={setUsingCustomRate}
            onRefreshRate={() => void exchangeRate.refresh()}
          />

          <ExpenseMetaFields
            form={form}
            isIncome={isIncome}
            participants={participants}
          />

          {documentsEnabled && (
            <ExpenseDocumentsField form={form} isIncome={isIncome} />
          )}
        </Card>

        <div className="flex flex-col gap-3.5">
          <PaidForList
            form={form}
            participants={participants}
            currency={groupCurrency}
            locale={locale}
            isIncome={isIncome}
            onShareEdited={markEdited}
          />

          {/* `remove` is handed over unwrapped: the confirmation dialog awaits
              it to know when to close, and `() => void remove()` would resolve
              a tick after the click instead. */}
          <ExpenseFormFooter
            isCreate={isCreate}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            onDelete={remove}
          />
        </div>
      </div>
    </form>
  )
}
