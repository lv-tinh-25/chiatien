'use client'

import { Button } from '@/components/core/atoms/Button'
import { FormInput } from '@/components/core/molecules/FormInput'
import { useExpenseCategorySuggestion } from '@/hooks/expenses/useExpenseCategorySuggestion'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { Loader2, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  isIncome: boolean
  categoryExtractEnabled: boolean
}

export function ExpenseTitleField({
  form,
  isIncome,
  categoryExtractEnabled,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const scope = isIncome ? 'Income' : 'Expense'
  const { suggest, isLoading } = useExpenseCategorySuggestion(
    categoryExtractEnabled,
    (categoryId) => form.setValue('category', categoryId),
  )

  return (
    <div className="flex items-start gap-2">
      <FormInput
        label={t(`${scope}.TitleField.label`)}
        placeholder={t(`${scope}.TitleField.placeholder`)}
        description={t(`${scope}.TitleField.description`)}
        errorKey={form.formState.errors.title?.message}
        fieldClassName="flex-1"
        {...form.register('title')}
      />
      {categoryExtractEnabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-6"
          disabled={isLoading}
          aria-label={t('categoryField.label')}
          onClick={() => void suggest(String(form.getValues('title') ?? ''))}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Sparkles aria-hidden />
          )}
        </Button>
      )}
    </div>
  )
}
