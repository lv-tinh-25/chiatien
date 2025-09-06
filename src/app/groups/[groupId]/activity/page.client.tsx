'use client'

import { ActivityLog } from '@/components/core/templates/ActivityLog'

/**
 * No aside: the design gives the activity log a single narrow column, and a
 * balances panel beside a timeline is two unrelated readings on one screen.
 */
export function ActivityLogPageClient() {
  return <ActivityLog />
}
