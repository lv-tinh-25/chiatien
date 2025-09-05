'use client'

import { ActivityLog } from '@/components/core/templates/ActivityLog'
import { GroupHeader } from '@/components/core/templates/GroupHeader'

export function ActivityLogPageClient() {
  return (
    <>
      <GroupHeader />
      <ActivityLog />
    </>
  )
}
