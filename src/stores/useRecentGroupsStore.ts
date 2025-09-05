'use client'

import {
  addRecent,
  partitionGroups,
  removeRecent,
  toggleIn,
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
  toggleStar: (groupId: string) => void
  toggleArchive: (groupId: string) => void
  partitioned: () => PartitionedGroups
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
      toggleStar: (groupId) =>
        set({ starredIds: toggleIn(get().starredIds, groupId) }),
      toggleArchive: (groupId) =>
        set({ archivedIds: toggleIn(get().archivedIds, groupId) }),
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
