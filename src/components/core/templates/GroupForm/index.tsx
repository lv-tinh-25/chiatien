'use client'

import { BackButton } from '@/components/core/atoms/BackButton'
import { GroupDetailsFields } from '@/components/core/templates/GroupForm/GroupDetailsFields'
import { GroupFormFooter } from '@/components/core/templates/GroupForm/GroupFormFooter'
import { GroupSettingsFields } from '@/components/core/templates/GroupForm/GroupSettingsFields'
import { ParticipantList } from '@/components/core/templates/GroupForm/ParticipantList'
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
  const {
    form,
    isEdit,
    fields,
    addParticipant,
    removeParticipant,
    isProtected,
    submit,
    isSubmitting,
    activeUser,
    setActiveUser,
    onCurrencyCodeChange,
  } = useGroupForm({ group, protectedParticipantIds, defaultCurrencyCode })

  return (
    <form onSubmit={submit} className="flex w-full max-w-180 flex-col gap-4">
      <div className="hidden items-center gap-3 lg:flex">
        <BackButton
          href={group ? `/groups/${group.id}/information` : '/groups'}
        />
        <h1 className="text-headline-lg text-foreground">
          {isEdit ? tNav('groupSettingsTitle') : tGroupForm('createTitle')}
        </h1>
      </div>
      <GroupDetailsFields
        form={form}
        onCurrencyCodeChange={onCurrencyCodeChange}
      />
      <ParticipantList
        form={form}
        fields={fields}
        isProtected={isProtected}
        onAdd={addParticipant}
        onRemove={removeParticipant}
      />
      {isEdit && group && (
        <GroupSettingsFields
          participants={group.participants}
          activeUser={activeUser}
          onActiveUserChange={setActiveUser}
        />
      )}
      <GroupFormFooter isEdit={isEdit} isSubmitting={isSubmitting} />
    </form>
  )
}
