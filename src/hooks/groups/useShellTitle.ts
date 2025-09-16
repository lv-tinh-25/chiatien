'use client'

import { parentOf } from '@/components/core/templates/AppShell/navigation'
import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export type ShellTitle = {
  /** Absent on the group list, where the brand mark stands in for a title. */
  title: string | null
  subtitle: string | null
  /** The screen one level up, or null where there is none. */
  back: string | null
  /**
   * The design hangs the group menu off the section screens only: a form is a
   * task, and its header carries nothing but a way back out.
   */
  showGroupMenu: boolean
}

/**
 * The mobile header names the screen, which on a phone is the only place the
 * name appears. Deriving it from the path keeps every screen free of chrome.
 */
export function useShellTitle(chrome: GroupChrome): ShellTitle {
  const pathname = usePathname()
  const t = useTranslations('Nav')
  const tExpense = useTranslations('ExpenseForm.Expense')
  const tGroupForm = useTranslations('GroupForm')

  const base = {
    title: null,
    subtitle: null,
    back: parentOf(pathname),
    showGroupMenu: false,
  }

  if (pathname === '/groups') return base
  if (pathname === '/groups/create')
    return { ...base, title: tGroupForm('createTitle') }

  const section = pathname.match(/^\/groups\/[^/]+\/([^/]+)/)?.[1] ?? null

  if (section === 'expenses') {
    if (pathname.endsWith('/create'))
      return { ...base, title: tExpense('create') }
    if (pathname.endsWith('/edit')) return { ...base, title: tExpense('edit') }
    return {
      ...base,
      title: chrome.name,
      subtitle:
        chrome.participantCount === 0
          ? null
          : `${t('memberCount', { count: chrome.participantCount })} · ${chrome.currency}`,
      showGroupMenu: true,
    }
  }

  if (section === 'balances')
    return {
      ...base,
      title: chrome.name,
      subtitle: t('balancesSubtitle'),
      showGroupMenu: true,
    }
  if (section === 'stats')
    return {
      ...base,
      title: chrome.name,
      subtitle: t('statsSubtitle'),
      showGroupMenu: true,
    }
  if (section === 'activity')
    return {
      ...base,
      title: chrome.name,
      subtitle: t('activitySubtitle'),
      showGroupMenu: true,
    }
  if (section === 'settings') {
    if (pathname.endsWith('/edit'))
      return { ...base, title: t('editSettingsTitle') }
    return {
      ...base,
      title: t('settings'),
      subtitle: chrome.name,
      showGroupMenu: true,
    }
  }

  return base
}
