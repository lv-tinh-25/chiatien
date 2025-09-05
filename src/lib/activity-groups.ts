import { isSameWeek } from '@/lib/date-groups'
import dayjs, { type Dayjs } from 'dayjs'

export const ACTIVITY_DATE_GROUPS = [
  'today',
  'yesterday',
  'earlierThisWeek',
  'lastWeek',
  'earlierThisMonth',
  'lastMonth',
  'earlierThisYear',
  'lastYear',
  'older',
] as const

export type ActivityDateGroup = (typeof ACTIVITY_DATE_GROUPS)[number]

export function activityDateGroup(
  time: Dayjs,
  today: Dayjs,
  weekStartsOn: number,
): ActivityDateGroup {
  if (today.isSame(time, 'day')) return 'today'
  if (today.subtract(1, 'day').isSame(time, 'day')) return 'yesterday'
  if (isSameWeek(today, time, weekStartsOn)) return 'earlierThisWeek'
  if (isSameWeek(today.subtract(1, 'week'), time, weekStartsOn))
    return 'lastWeek'
  if (today.isSame(time, 'month')) return 'earlierThisMonth'
  if (today.subtract(1, 'month').isSame(time, 'month')) return 'lastMonth'
  if (today.isSame(time, 'year')) return 'earlierThisYear'
  if (today.subtract(1, 'year').isSame(time, 'year')) return 'lastYear'
  return 'older'
}

/**
 * Buckets activities into the headings the log renders under, in calendar order
 * rather than the order the buckets happened to be filled. Empty buckets are
 * dropped so the caller can render straight through.
 */
export function groupActivitiesByDate<T extends { time: Date }>(
  activities: T[],
  today: Dayjs,
  weekStartsOn: number,
): { group: ActivityDateGroup; activities: T[] }[] {
  const buckets = new Map<ActivityDateGroup, T[]>()

  for (const activity of activities) {
    const group = activityDateGroup(dayjs(activity.time), today, weekStartsOn)
    const bucket = buckets.get(group) ?? []
    bucket.push(activity)
    buckets.set(group, bucket)
  }

  return ACTIVITY_DATE_GROUPS.flatMap((group) => {
    const activitiesInGroup = buckets.get(group)
    return activitiesInGroup === undefined
      ? []
      : [{ group, activities: activitiesInGroup }]
  })
}
