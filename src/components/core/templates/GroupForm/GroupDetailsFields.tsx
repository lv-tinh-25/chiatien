'use client'

import { Card, CardContent } from '@/components/core/atoms/Card'
import { CurrencyChips } from '@/components/core/molecules/CurrencyChips'
import { FormField } from '@/components/core/molecules/FormField'
import { FormInput } from '@/components/core/molecules/FormInput'
import { FormTextarea } from '@/components/core/molecules/FormTextarea'
import { useFormErrors } from '@/hooks/forms/useFormErrors'
import { asLocale } from '@/i18n/locales'
import { currencyChoicesWith } from '@/lib/currency-choices'
import type { GroupFormValues } from '@/lib/schemas'
import { useLocale, useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

type GroupDetailsFieldsProps = {
  form: UseFormReturn<GroupFormValues>
  onCurrencyCodeChange: (code: string) => void
}

export function GroupDetailsFields({
  form,
  onCurrencyCodeChange,
}: GroupDetailsFieldsProps) {
  const t = useTranslations('GroupForm')
  const locale = asLocale(useLocale())
  const errors = useFormErrors(form.control)
  const currencyCode = useWatch({ control: form.control, name: 'currencyCode' })

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-5">
        <FormInput
          label={t('NameField.label')}
          placeholder={t('NameField.placeholder')}
          errorKey={errors.name?.message}
          {...form.register('name')}
        />

        {/* The information field is on the create form too: the design writes
            the group's rules down at the moment the group is made. */}
        <FormTextarea
          label={t('InformationField.label')}
          placeholder={t('InformationField.placeholder')}
          errorKey={errors.information?.message}
          {...form.register('information')}
        />

        <FormField
          label={t('CurrencyCodeField.label')}
          errorKey={errors.currencyCode?.message}
        >
          {({ id, describedBy }) => (
            <CurrencyChips
              id={id}
              aria-describedby={describedBy}
              variant="outline"
              value={currencyCode ?? ''}
              options={currencyChoicesWith(locale, currencyCode)}
              onValueChange={onCurrencyCodeChange}
              label={t('CurrencyCodeField.label')}
            />
          )}
        </FormField>

        {/* Only reachable for a group already stored on a custom symbol: the
            chips above can no longer put one there. */}
        {(currencyCode ?? '') === '' && (
          <FormInput
            label={t('CurrencyField.label')}
            placeholder={t('CurrencyField.placeholder')}
            maxLength={5}
            errorKey={errors.currency?.message}
            {...form.register('currency')}
          />
        )}
      </CardContent>
    </Card>
  )
}
