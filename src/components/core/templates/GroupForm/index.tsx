'use client'

import { BackButton } from '@/components/core/atoms/BackButton'
import { GroupDetailsFields } from '@/components/core/templates/GroupForm/GroupDetailsFields'
import { GroupFormFooter } from '@/components/core/templates/GroupForm/GroupFormFooter'
import { ParticipantList } from '@/components/core/templates/GroupForm/ParticipantList'
import { useParentPath } from '@/hooks/forms/useParentPath'
import { useGroupForm } from '@/hooks/groups/useGroupForm'
import { useTranslations } from 'next-intl'

type ExistingGroup = {
  id: string
  name: string
  information: string | null
  currency: string
  currencyCode: string | null
  participants: { id: string; name: string }[]
}

type GroupFormProps = {
  group?: ExistingGroup
  protectedParticipantIds?: string[]
  defaultCurrencyCode?: string
}

export function GroupForm({
  group,
  protectedParticipantIds,
  defaultCurrencyCode,
}: GroupFormProps) {
  const tNav = useTranslations('Nav')
  const tGroupForm = useTranslations('GroupForm')
  const back = useParentPath()
  const {
    form,
    isEdit,
    fields,
    addParticipant,
    removeParticipant,
    isProtected,
    submit,
    isSubmitting,
    canSubmit,
    onCurrencyCodeChange,
    currencyLocked,
  } = useGroupForm({ group, protectedParticipantIds, defaultCurrencyCode })

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4 lg:max-w-180">
      <div className="hidden items-center gap-3 lg:flex">
        {back !== null && <BackButton href={back} />}
        <h1 className="text-headline-lg text-foreground">
          {isEdit ? tNav('editSettingsTitle') : tGroupForm('createTitle')}
        </h1>
      </div>
      <GroupDetailsFields
        form={form}
        onCurrencyCodeChange={onCurrencyCodeChange}
        currencyLocked={currencyLocked}
      />
      <ParticipantList
        form={form}
        fields={fields}
        isProtected={isProtected}
        onAdd={addParticipant}
        onRemove={removeParticipant}
      />
      <GroupFormFooter
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
      />
    </form>
  )
}
