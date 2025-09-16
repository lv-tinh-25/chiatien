'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { FormField } from '@/components/core/molecules/FormField'
import { Select } from '@/components/core/molecules/Select'
import { useTranslations } from 'next-intl'

const NONE = '__none__'

export function ActiveUserField({
  participants,
  activeUserId,
  onChange,
}: {
  participants: { id: string; name: string }[]
  activeUserId: string | null
  onChange: (participantId: string | null) => void
}) {
  const t = useTranslations('Groups.Settings.ActiveUser')

  const options = [
    { value: NONE, label: t('none') },
    ...participants.map((participant) => ({
      value: participant.id,
      label: participant.name,
    })),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField label={t('label')} description={t('description')}>
          {({ id, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              value={activeUserId ?? NONE}
              onValueChange={(value) => onChange(value === NONE ? null : value)}
              options={options}
              placeholder={t('placeholder')}
            />
          )}
        </FormField>
      </CardContent>
    </Card>
  )
}
