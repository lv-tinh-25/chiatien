'use client'

import { Button } from '@/components/core/atoms/Button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { ParticipantRow } from '@/components/core/templates/GroupForm/ParticipantRow'
import { useFormErrors } from '@/hooks/forms/useFormErrors'
import type { GroupFormValues } from '@/lib/schemas'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

type ParticipantListProps = {
  form: UseFormReturn<GroupFormValues>
  fields: FieldArrayWithId<GroupFormValues, 'participants'>[]
  isProtected: (index: number) => boolean
  onAdd: () => void
  onRemove: (index: number) => void
}

export function ParticipantList({
  form,
  fields,
  isProtected,
  onAdd,
  onRemove,
}: ParticipantListProps) {
  const t = useTranslations('GroupForm.Participants')
  const errors = useFormErrors(form.control).participants
  const names = (
    useWatch({ control: form.control, name: 'participants' }) ?? []
  ).map((participant) => participant?.name ?? '')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-body-lg font-extrabold">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {fields.map((field, index) => (
            <ParticipantRow
              key={field.id}
              index={index}
              name={names[index] ?? ''}
              peers={names}
              registration={form.register(`participants.${index}.name`)}
              errorKey={errors?.[index]?.name?.message}
              removable={fields.length > 1 && !isProtected(index)}
              onRemove={() => onRemove(index)}
            />
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onAdd}
        >
          <Plus aria-hidden />
          {t('add')}
        </Button>
      </CardContent>
    </Card>
  )
}
