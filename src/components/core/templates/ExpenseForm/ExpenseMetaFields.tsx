'use client'

import { DateInput } from '@/components/core/atoms/DateInput'
import { CategoryChips } from '@/components/core/molecules/CategoryChips'
import { FormField } from '@/components/core/molecules/FormField'
import { FormTextarea } from '@/components/core/molecules/FormTextarea'
import { PayerPicker } from '@/components/core/molecules/PayerPicker'
import { ExpenseRecurrenceField } from '@/components/core/templates/ExpenseForm/ExpenseRecurrenceField'
import { useFormErrors } from '@/hooks/forms/useFormErrors'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { trpc } from '@/trpc/client'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  isIncome: boolean
  participants: { id: string; name: string }[]
}

function toDateInputValue(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export function ExpenseMetaFields({ form, isIncome, participants }: Props) {
  const t = useTranslations('ExpenseForm')
  const errors = useFormErrors(form.control)
  const scope = isIncome ? 'Income' : 'Expense'
  const { data } = trpc.categories.list.useQuery()
  const expenseDate = useWatch({ control: form.control, name: 'expenseDate' })
  const category = useWatch({ control: form.control, name: 'category' })
  const paidBy = useWatch({ control: form.control, name: 'paidBy' })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        <FormField
          label={t(`${scope}.DateField.label`)}
          errorKey={errors.expenseDate?.message}
        >
          {({ id, describedBy }) => (
            <DateInput
              id={id}
              aria-describedby={describedBy}
              value={toDateInputValue(expenseDate)}
              onChange={(event) =>
                form.setValue('expenseDate', new Date(event.target.value), {
                  shouldDirty: true,
                })
              }
            />
          )}
        </FormField>
        <ExpenseRecurrenceField form={form} />
      </div>

      <FormField label={t('categoryField.label')}>
        {({ id, describedBy }) => (
          <CategoryChips
            id={id}
            aria-describedby={describedBy}
            value={Number(category ?? 0)}
            onValueChange={(value) => form.setValue('category', value)}
            categories={data?.categories ?? []}
          />
        )}
      </FormField>

      <FormField
        label={t(`${scope}.paidByField.label`)}
        errorKey={errors.paidBy?.message}
      >
        {({ id, describedBy }) => (
          <PayerPicker
            id={id}
            testId="paid-by"
            aria-describedby={describedBy}
            value={String(paidBy ?? '')}
            participants={participants}
            onValueChange={(value) =>
              form.setValue('paidBy', value, { shouldValidate: true })
            }
          />
        )}
      </FormField>

      <FormTextarea
        label={t('notesField.label')}
        rows={2}
        errorKey={errors.notes?.message}
        {...form.register('notes')}
      />
    </div>
  )
}
