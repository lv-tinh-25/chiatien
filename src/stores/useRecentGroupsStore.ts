'use client'

import {
  addRecent,
  partitionGroups,
  removeRecent,
  setArchived,
  setStarred,
  type PartitionedGroups,
  type RecentGroup,
  type RecentGroups,
} from '@/lib/recent-groups'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type RecentGroupsState = {
  groups: RecentGroups
  starredIds: string[]
  archivedIds: string[]
  hydrated: boolean
  markHydrated: () => void
  visit: (group: RecentGroup) => void
  forget: (groupId: string) => void
  /** Explicit rather than a toggle, so undoing a change can restore a value. */
  setStarred: (groupId: string, starred: boolean) => void
  setArchived: (groupId: string, archived: boolean) => void
  partitioned: () => PartitionedGroups
}

function membershipOf(state: RecentGroupsState) {
  return { starredIds: state.starredIds, archivedIds: state.archivedIds }
}

export const useRecentGroupsStore = create<RecentGroupsState>()(
  persist(
    (set, get) => ({
      groups: [],
      starredIds: [],
      archivedIds: [],
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      visit: (group) => set({ groups: addRecent(get().groups, group) }),
      forget: (groupId) =>
        set({
          groups: removeRecent(get().groups, groupId),
          starredIds: get().starredIds.filter((id) => id !== groupId),
          archivedIds: get().archivedIds.filter((id) => id !== groupId),
        }),
      setStarred: (groupId, starred) =>
        set(setStarred(membershipOf(get()), groupId, starred)),
      setArchived: (groupId, archived) =>
        set(setArchived(membershipOf(get()), groupId, archived)),
      partitioned: () =>
        partitionGroups(get().groups, get().starredIds, get().archivedIds),
    }),
    {
      name: 'chiatien.recent-groups',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ groups, starredIds, archivedIds }) => ({
        groups,
        starredIds,
        archivedIds,
      }),
      // Storage is empty during server rendering, so screens wait for this flag
      // instead of flashing an empty state that immediately changes.
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
)
