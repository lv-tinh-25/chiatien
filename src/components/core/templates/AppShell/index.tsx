'use client'

import { AppTopBar } from '@/components/core/templates/AppShell/AppTopBar'
import { BottomNav } from '@/components/core/templates/AppShell/BottomNav'
import { Fab } from '@/components/core/templates/AppShell/Fab'
import { MobileTopBar } from '@/components/core/templates/AppShell/MobileTopBar'
import { Sidebar } from '@/components/core/templates/AppShell/Sidebar'
import { useGroupChrome } from '@/hooks/groups/useGroupChrome'
import { useShellTitle } from '@/hooks/groups/useShellTitle'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/useNavigationStore'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  const chrome = useGroupChrome()
  const shellTitle = useShellTitle(chrome)
  const tGroups = useTranslations('Groups')
  const tExpenses = useTranslations('Expenses')

  // One place records where the app has been; the forms read it to decide how
  // to leave themselves behind.
  const pathname = usePathname()
  const visit = useNavigationStore((state) => state.visit)
  useEffect(() => visit(pathname), [pathname, visit])

  return (
    <div className="min-h-svh">
      <AppTopBar chrome={chrome} />
      {chrome.groupId !== null && <Sidebar chrome={chrome} />}
      <MobileTopBar chrome={chrome} shellTitle={shellTitle} />

      <main
        className={cn(
          'px-4 pt-17 lg:px-8 lg:pt-21 lg:pb-12',
          chrome.showBottomNav ? 'pb-28' : 'pb-10',
          chrome.groupId !== null && 'lg:pl-70',
        )}
      >
        <div className="mx-auto w-full lg:max-w-[1440px]">
          {children}
        </div>
      </main>

      {chrome.showBottomNav && <BottomNav items={chrome.items} />}

      {chrome.fab !== null && (
        <Fab
          href={chrome.fab.href}
          label={
            chrome.fab.aboveNav ? tExpenses('create') : tGroups('createGroup')
          }
          aboveNav={chrome.fab.aboveNav}
        />
      )}
    </div>
  )
}
