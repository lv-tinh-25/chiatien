import { z } from 'zod'

export const recentGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
})

export const recentGroupsSchema = z.array(recentGroupSchema)
export const groupIdsSchema = z.array(z.string().min(1))

export type RecentGroup = z.infer<typeof recentGroupSchema>
export type RecentGroups = RecentGroup[]

export function addRecent(
  groups: RecentGroups,
  group: RecentGroup,
): RecentGroups {
  return [group, ...groups.filter((known) => known.id !== group.id)]
}

export function removeRecent(
  groups: RecentGroups,
  groupId: string,
): RecentGroups {
  return groups.filter((group) => group.id !== groupId)
}

export function toggleIn(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((known) => known !== id) : [...ids, id]
}

export type PartitionedGroups<T = RecentGroup> = {
  starred: T[]
  recent: T[]
  archived: T[]
}

/**
 * A group can be both starred and archived in storage. Starring wins, so a
 * group is never rendered in two sections at once.
 */
export function partitionGroups<T extends { id: string }>(
  groups: T[],
  starredIds: string[],
  archivedIds: string[],
): PartitionedGroups<T> {
  const partitioned: PartitionedGroups<T> = {
    starred: [],
    recent: [],
    archived: [],
  }

  for (const group of groups) {
    if (starredIds.includes(group.id)) partitioned.starred.push(group)
    else if (archivedIds.includes(group.id)) partitioned.archived.push(group)
    else partitioned.recent.push(group)
  }

  return partitioned
}
