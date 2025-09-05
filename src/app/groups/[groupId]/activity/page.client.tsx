'use client'

import { ActivityLog } from '@/components/core/templates/ActivityLog'
import { GroupHeader } from '@/components/core/templates/GroupHeader'
import { GroupScreen } from '@/components/core/templates/GroupScreen'
import { GroupSummaryAside } from '@/components/core/templates/GroupScreen/GroupSummaryAside'

export function ActivityLogPageClient() {
  return (
    <>
      <GroupHeader />
      <GroupScreen aside={<GroupSummaryAside />}>
        <ActivityLog />
      </GroupScreen>
    </>
  )
}
