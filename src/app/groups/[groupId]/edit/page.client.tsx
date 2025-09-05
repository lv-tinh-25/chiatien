'use client'

import { GroupForm } from '@/components/core/templates/GroupForm'
import { GroupHeader } from '@/components/core/templates/GroupHeader'
import { trpc } from '@/trpc/client'

export function EditGroupPageClient({ groupId }: { groupId: string }) {
  const { data, isPending } = trpc.groups.getDetails.useQuery({ groupId })

  if (isPending || !data) return null

  return (
    <>
      <GroupHeader />
      <GroupForm
        group={data.group}
        protectedParticipantIds={data.participantsWithExpenses}
      />
    </>
  )
}
