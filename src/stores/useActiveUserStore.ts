'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type ActiveUserState = {
  activeUsers: Record<string, string>
  hydrated: boolean
  markHydrated: () => void
  setActiveUser: (groupId: string, participantId: string | null) => void
  activeUserFor: (groupId: string) => string | null
}

export const useActiveUserStore = create<ActiveUserState>()(
  persist(
    (set, get) => ({
      activeUsers: {},
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      setActiveUser: (groupId, participantId) => {
        const activeUsers = { ...get().activeUsers }
        if (participantId === null) delete activeUsers[groupId]
        else activeUsers[groupId] = participantId
        set({ activeUsers })
      },
      activeUserFor: (groupId) => get().activeUsers[groupId] ?? null,
    }),
    {
      name: 'chiatien.active-users',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ activeUsers }) => ({ activeUsers }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
)
