'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { FormField } from '@/components/core/molecules/FormField'
import { Select } from '@/components/core/molecules/Select'
import { useTranslations } from 'next-intl'

const NONE = '__none__'

type GroupSettingsFieldsProps = {
  participants: { id?: string; name: string }[]
  activeUser: string | null
  onActiveUserChange: (participantId: string | null) => void
}

/**
 * Stored per device rather than in the group, so it is deliberately outside the
 * form schema and saves as soon as it changes.
 */
export function GroupSettingsFields({
  participants,
  activeUser,
  onActiveUserChange,
}: GroupSettingsFieldsProps) {
  const t = useTranslations('GroupForm.Settings')

  const options = [
    { value: NONE, label: t('ActiveUserField.none') },
    ...participants
      .filter((participant) => participant.id !== undefined)
      .map((participant) => ({
        value: participant.id ?? NONE,
        label: participant.name,
      })),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          label={t('ActiveUserField.label')}
          description={t('ActiveUserField.description')}
        >
          {({ id, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              value={activeUser ?? NONE}
              onValueChange={(value) =>
                onActiveUserChange(value === NONE ? null : value)
              }
              options={options}
              placeholder={t('ActiveUserField.placeholder')}
            />
          )}
        </FormField>
      </CardContent>
    </Card>
  )
}
