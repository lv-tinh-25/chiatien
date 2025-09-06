'use client'

import { AppTopBar } from '@/components/core/templates/AppShell/AppTopBar'
import { BottomNav } from '@/components/core/templates/AppShell/BottomNav'
import { Fab } from '@/components/core/templates/AppShell/Fab'
import { MobileTopBar } from '@/components/core/templates/AppShell/MobileTopBar'
import { Sidebar } from '@/components/core/templates/AppShell/Sidebar'
import { useGroupChrome } from '@/hooks/groups/useGroupChrome'
import { useShellTitle } from '@/hooks/groups/useShellTitle'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  const chrome = useGroupChrome()
  const shellTitle = useShellTitle(chrome)
  const tGroups = useTranslations('Groups')
  const tExpenses = useTranslations('Expenses')

  return (
    <div className="min-h-dvh">
      <AppTopBar chrome={chrome} />
      {chrome.groupId !== null && <Sidebar chrome={chrome} />}
      <MobileTopBar chrome={chrome} shellTitle={shellTitle} />

      <main
        className={cn(
          'px-4 pt-17 pb-28 lg:px-8 lg:pt-21 lg:pb-12',
          chrome.groupId !== null && 'lg:pl-70',
        )}
      >
        <div className="mx-auto w-full max-w-[480px] lg:max-w-[1080px]">
          {children}
        </div>
      </main>

      {chrome.groupId !== null && <BottomNav items={chrome.bottomItems} />}

      {chrome.fab !== null && (
        <Fab
          href={chrome.fab.href}
          label={chrome.fab.aboveNav ? tExpenses('create') : tGroups('createGroup')}
          aboveNav={chrome.fab.aboveNav}
        />
      )}
    </div>
  )
}
