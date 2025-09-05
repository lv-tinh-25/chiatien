'use client'

import type { SplittingOptions } from '@/lib/schemas'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SplittingOptionsState = {
  byGroup: Record<string, SplittingOptions>
  hydrated: boolean
  markHydrated: () => void
  remember: (groupId: string, options: SplittingOptions) => void
  forGroup: (groupId: string) => SplittingOptions | null
}

export const useSplittingOptionsStore = create<SplittingOptionsState>()(
  persist(
    (set, get) => ({
      byGroup: {},
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      remember: (groupId, options) =>
        set({ byGroup: { ...get().byGroup, [groupId]: options } }),
      forGroup: (groupId) => get().byGroup[groupId] ?? null,
    }),
    {
      name: 'chiatien.splitting-options',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ byGroup }) => ({ byGroup }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
)
