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

function withId(ids: string[], id: string, present: boolean): string[] {
  if (present) return ids.includes(id) ? ids : [...ids, id]
  return ids.filter((known) => known !== id)
}

/** The two flags a browser keeps about one of its own groups. */
export type Membership = {
  starredIds: string[]
  archivedIds: string[]
}

export function setStarred(
  membership: Membership,
  groupId: string,
  starred: boolean,
): Membership {
  return {
    ...membership,
    starredIds: withId(membership.starredIds, groupId, starred),
  }
}

/**
 * Archiving puts a group away, so it cannot stay pinned at the top: the star
 * goes with it. Unarchiving does not bring the star back — the group returns to
 * Recent, and pinning it again is a separate decision.
 */
export function setArchived(
  membership: Membership,
  groupId: string,
  archived: boolean,
): Membership {
  return {
    starredIds: archived
      ? withId(membership.starredIds, groupId, false)
      : membership.starredIds,
    archivedIds: withId(membership.archivedIds, groupId, archived),
  }
}

export type PartitionedGroups<T = RecentGroup> = {
  starred: T[]
  recent: T[]
  archived: T[]
}

/**
 * Archiving clears the star, so the two flags no longer overlap. Storage
 * written before that rule can still carry both, and archiving wins there:
 * the menu offers no way to unstar an archived group, so rendering it under
 * Starred would strand it.
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
    if (archivedIds.includes(group.id)) partitioned.archived.push(group)
    else if (starredIds.includes(group.id)) partitioned.starred.push(group)
    else partitioned.recent.push(group)
  }

  return partitioned
}
