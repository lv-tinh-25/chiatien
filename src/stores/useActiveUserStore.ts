'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** Recorded when someone is asked who they are and declines to say. */
export const NO_ACTIVE_USER = 'none'

type ActiveUserState = {
  activeUsers: Record<string, string>
  /** Set by the test harness so the identity prompt never opens. */
  suppressPrompt: boolean
  hydrated: boolean
  markHydrated: () => void
  setActiveUser: (groupId: string, participantId: string | null) => void
  activeUserFor: (groupId: string) => string | null
  hasAnswered: (groupId: string) => boolean
}

export const useActiveUserStore = create<ActiveUserState>()(
  persist(
    (set, get) => ({
      activeUsers: {},
      suppressPrompt: false,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      setActiveUser: (groupId, participantId) =>
        set({
          activeUsers: {
            ...get().activeUsers,
            [groupId]: participantId ?? NO_ACTIVE_USER,
          },
        }),
      activeUserFor: (groupId) => {
        const stored = get().activeUsers[groupId]
        return stored === undefined || stored === NO_ACTIVE_USER ? null : stored
      },
      hasAnswered: (groupId) => get().activeUsers[groupId] !== undefined,
    }),
    {
      name: 'chiatien.active-users',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ activeUsers, suppressPrompt }) => ({
        activeUsers,
        suppressPrompt,
      }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
)
