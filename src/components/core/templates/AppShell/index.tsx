'use client'

import { BottomNav } from '@/components/core/templates/AppShell/BottomNav'
import { navigationFor } from '@/components/core/templates/AppShell/navigation'
import { Sidebar } from '@/components/core/templates/AppShell/Sidebar'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  const navigation = navigationFor(usePathname())
  const inGroup = navigation.scope === 'group' && navigation.groupId !== null

  return (
    <div className="min-h-dvh">
      {inGroup && navigation.groupId !== null && (
        <Sidebar items={navigation.items} groupId={navigation.groupId} />
      )}

      {/* The left padding clears the floating sidebar: 1rem inset + 15rem panel
          + 1.5rem gutter. */}
      <main className={cn('pb-thumb-safe lg:pb-14', inGroup && 'lg:pl-[17.5rem]')}>
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {inGroup && <BottomNav items={navigation.items} />}
    </div>
  )
}
