'use client'

import { ActivityLog } from '@/components/core/templates/ActivityLog'
import { GroupScreen } from '@/components/core/templates/GroupScreen'
import { GroupSummaryAside } from '@/components/core/templates/GroupScreen/GroupSummaryAside'

export function ActivityLogPageClient() {
  return (
    <>
      <GroupScreen aside={<GroupSummaryAside />}>
        <ActivityLog />
      </GroupScreen>
    </>
  )
}
