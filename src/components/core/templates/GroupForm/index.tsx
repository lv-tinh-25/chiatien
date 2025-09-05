'use client'

import { GroupDetailsFields } from '@/components/core/templates/GroupForm/GroupDetailsFields'
import { GroupFormFooter } from '@/components/core/templates/GroupForm/GroupFormFooter'
import { GroupSettingsFields } from '@/components/core/templates/GroupForm/GroupSettingsFields'
import { ParticipantList } from '@/components/core/templates/GroupForm/ParticipantList'
import { useGroupForm } from '@/hooks/groups/useGroupForm'

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
    <form onSubmit={submit} className="flex flex-col gap-4 py-4">
      <GroupDetailsFields
        form={form}
        isEdit={isEdit}
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
      <GroupFormFooter
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        cancelHref={group ? `/groups/${group.id}/expenses` : '/groups'}
      />
    </form>
  )
}
