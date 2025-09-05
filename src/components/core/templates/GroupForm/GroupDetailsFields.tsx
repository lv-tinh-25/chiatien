'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { CurrencySelect } from '@/components/core/molecules/CurrencySelect'
import { FormField } from '@/components/core/molecules/FormField'
import { FormInput } from '@/components/core/molecules/FormInput'
import { FormTextarea } from '@/components/core/molecules/FormTextarea'
import { asLocale } from '@/i18n/locales'
import type { GroupFormValues } from '@/lib/schemas'
import { useLocale, useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

type GroupDetailsFieldsProps = {
  form: UseFormReturn<GroupFormValues>
  isEdit: boolean
  onCurrencyCodeChange: (code: string) => void
}

export function GroupDetailsFields({
  form,
  isEdit,
  onCurrencyCodeChange,
}: GroupDetailsFieldsProps) {
  const t = useTranslations('GroupForm')
  const locale = asLocale(useLocale())
  const { errors } = form.formState
  const currencyCode = useWatch({ control: form.control, name: 'currencyCode' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormInput
          label={t('NameField.label')}
          placeholder={t('NameField.placeholder')}
          description={t('NameField.description')}
          errorKey={errors.name?.message}
          {...form.register('name')}
        />

        <FormField
          label={t('CurrencyCodeField.label')}
          description={t(
            isEdit
              ? 'CurrencyCodeField.editDescription'
              : 'CurrencyCodeField.createDescription',
          )}
          errorKey={errors.currencyCode?.message}
        >
          {({ id, describedBy }) => (
            <CurrencySelect
              id={id}
              aria-describedby={describedBy}
              locale={locale}
              value={currencyCode ?? ''}
              customLabel={t('CurrencyCodeField.customOption')}
              onValueChange={onCurrencyCodeChange}
            />
          )}
        </FormField>

        {(currencyCode ?? '') === '' && (
          <FormInput
            label={t('CurrencyField.label')}
            placeholder={t('CurrencyField.placeholder')}
            description={t('CurrencyField.description')}
            maxLength={5}
            errorKey={errors.currency?.message}
            {...form.register('currency')}
          />
        )}

        {isEdit && (
          <FormTextarea
            label={t('InformationField.label')}
            placeholder={t('InformationField.placeholder')}
            errorKey={errors.information?.message}
            {...form.register('information')}
          />
        )}
      </CardContent>
    </Card>
  )
}
