'use client'

import { FormField } from '@/components/core/molecules/FormField'
import { Select } from '@/components/core/molecules/Select'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

const RULES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'] as const
const LABEL_KEYS = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const

export function ExpenseRecurrenceField({
  form,
}: {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
}) {
  const t = useTranslations('ExpenseForm.Expense.recurrenceRule')
  const recurrenceRule = useWatch({
    control: form.control,
    name: 'recurrenceRule',
  })

  return (
    <FormField label={t('label')} description={t('description')}>
      {({ id, describedBy }) => (
        <Select
          id={id}
          aria-describedby={describedBy}
          value={String(recurrenceRule ?? 'NONE')}
          onValueChange={(value) =>
            form.setValue(
              'recurrenceRule',
              RULES.find((rule) => rule === value),
            )
          }
          options={RULES.map((rule) => ({
            value: rule,
            label: t(LABEL_KEYS[rule]),
          }))}
        />
      )}
    </FormField>
  )
}
