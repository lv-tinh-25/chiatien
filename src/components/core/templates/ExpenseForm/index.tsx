'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { Checkbox } from '@/components/core/atoms/Checkbox'
import { AdvancedSplitCollapsible } from '@/components/core/templates/ExpenseForm/AdvancedSplitCollapsible'
import { ExpenseAmountField } from '@/components/core/templates/ExpenseForm/ExpenseAmountField'
import { ExpenseFormFooter } from '@/components/core/templates/ExpenseForm/ExpenseFormFooter'
import { ExpenseMetaFields } from '@/components/core/templates/ExpenseForm/ExpenseMetaFields'
import { ExpenseRecurrenceField } from '@/components/core/templates/ExpenseForm/ExpenseRecurrenceField'
import { PaidForList } from '@/components/core/templates/ExpenseForm/PaidForList'
import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { useExpenseForm } from '@/hooks/expenses/useExpenseForm'
import type { AppRouterOutput } from '@/trpc/routers/_app'
import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'
import { ExpenseTitleField } from '@/components/core/templates/ExpenseForm/ExpenseTitleField'

type Expense = AppRouterOutput['groups']['expenses']['get']['expense']

type ExpenseFormProps = {
  expense?: Expense
  categoryExtractEnabled: boolean
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

function ExpenseFormFields({ expense, categoryExtractEnabled }: ExpenseFormProps) {
  const t = useTranslations('ExpenseForm')
  const {
    form,
    groupId,
    groupCurrency,
    participants,
    isCreate,
    submit,
    remove,
    markEdited,
    isSubmitting,
  } = useExpenseForm(expense)

  const amount = useWatch({ control: form.control, name: 'amount' })
  const isReimbursement = useWatch({
    control: form.control,
    name: 'isReimbursement',
  })

  const isIncome = Number(amount) < 0
  const scope = isIncome ? 'Income' : 'Expense'

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreate ? t(`${scope}.create`) : t(`${scope}.edit`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ExpenseTitleField
            form={form}
            isIncome={isIncome}
            categoryExtractEnabled={categoryExtractEnabled}
          />
          <ExpenseAmountField form={form} currency={groupCurrency} />

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

          <ExpenseMetaFields
            form={form}
            isIncome={isIncome}
            participants={participants}
          />
          <ExpenseRecurrenceField form={form} />
        </CardContent>
      </Card>

      <PaidForList
        form={form}
        participants={participants}
        currency={groupCurrency}
        isIncome={isIncome}
        onShareEdited={markEdited}
      />

      <AdvancedSplitCollapsible form={form} isIncome={isIncome} />

      <ExpenseFormFooter
        isCreate={isCreate}
        isSubmitting={isSubmitting}
        cancelHref={`/groups/${groupId}/expenses`}
        onDelete={() => void remove()}
      />
    </form>
  )
}
