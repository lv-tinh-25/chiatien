'use client'

import { BottomNav } from '@/components/core/templates/AppShell/BottomNav'
import { navigationFor } from '@/components/core/templates/AppShell/navigation'
import { Sidebar } from '@/components/core/templates/AppShell/Sidebar'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  const navigation = navigationFor(usePathname())
  const inGroup = navigation.scope === 'group' && navigation.groupId !== null

  return (
    <div className="flex min-h-dvh">
      {inGroup && navigation.groupId !== null && (
        <Sidebar items={navigation.items} groupId={navigation.groupId} />
      )}
      <div className="flex-1">
        <main className="mx-auto max-w-[1080px] px-4 pb-thumb-safe sm:px-6">
          {children}
        </main>
      </div>
      {inGroup && <BottomNav items={navigation.items} />}
    </div>
  )
}
