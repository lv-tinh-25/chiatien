'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { FormField } from '@/components/core/molecules/FormField'
import { Select } from '@/components/core/molecules/Select'
import { localeLabels, locales, asLocale } from '@/i18n/locales'
import { setUserLocale } from '@/lib/locale'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export function Settings() {
  const t = useTranslations('Settings')
  const tNav = useTranslations('Nav')
  const locale = asLocale(useLocale())
  const router = useRouter()

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField label={tNav('settings')}>
          {({ id }) => (
            <Select
              id={id}
              value={locale}
              onValueChange={(value) => {
                const next = locales.find((candidate) => candidate === value)
                if (!next) return
                void setUserLocale(next).then(() => router.refresh())
              }}
              options={locales.map((candidate) => ({
                value: candidate,
                label: localeLabels[candidate],
              }))}
            />
          )}
        </FormField>
      </CardContent>
    </Card>
  )
}
