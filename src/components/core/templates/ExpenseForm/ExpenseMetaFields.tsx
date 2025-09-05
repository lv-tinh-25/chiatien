'use client'

import { FormField } from '@/components/core/molecules/FormField'
import { FormTextarea } from '@/components/core/molecules/FormTextarea'
import { Select } from '@/components/core/molecules/Select'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { trpc } from '@/trpc/client'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

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
  const tCategories = useTranslations('Categories')
  const scope = isIncome ? 'Income' : 'Expense'
  const { data } = trpc.categories.list.useQuery()
  const expenseDate = useWatch({ control: form.control, name: 'expenseDate' })
  const category = useWatch({ control: form.control, name: 'category' })
  const paidBy = useWatch({ control: form.control, name: 'paidBy' })

  const categoryOptions = useMemo(
    () =>
      (data?.categories ?? []).map((category) => ({
        value: String(category.id),
        label: tCategories(`${category.grouping}.${category.name}`),
      })),
    [data, tCategories],
  )

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label={t(`${scope}.DateField.label`)}
        description={t(`${scope}.DateField.description`)}
        errorKey={form.formState.errors.expenseDate?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            type="date"
            aria-describedby={describedBy}
            className="flex min-h-touch-min w-full rounded-control border border-input bg-card px-3 text-body-lg text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
            value={toDateInputValue(expenseDate)}
            onChange={(event) =>
              form.setValue('expenseDate', new Date(event.target.value), {
                shouldDirty: true,
              })
            }
          />
        )}
      </FormField>

      <FormField
        label={t('categoryField.label')}
        description={t(`${scope}.categoryFieldDescription`)}
      >
        {({ id, describedBy }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            value={String(category ?? 0)}
            onValueChange={(value) => form.setValue('category', Number(value))}
            options={categoryOptions}
          />
        )}
      </FormField>

      <FormField
        label={t(`${scope}.paidByField.label`)}
        description={t(`${scope}.paidByField.description`)}
        errorKey={form.formState.errors.paidBy?.message}
      >
        {({ id, describedBy }) => (
          <Select
            id={id}
            testId="paid-by"
            aria-describedby={describedBy}
            value={String(paidBy ?? '')}
            onValueChange={(value) => form.setValue('paidBy', value)}
            options={participants.map((participant) => ({
              value: participant.id,
              label: participant.name,
            }))}
            placeholder={t(`${scope}.paidByField.placeholder`)}
          />
        )}
      </FormField>

      <FormTextarea
        label={t('notesField.label')}
        errorKey={form.formState.errors.notes?.message}
        {...form.register('notes')}
      />
    </div>
  )
}
