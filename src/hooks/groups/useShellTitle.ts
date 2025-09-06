'use client'

import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export type ShellTitle = {
  /** Absent on the group list, where the brand mark stands in for a title. */
  title: string | null
  subtitle: string | null
  showBack: boolean
  /** False on the settings screen itself. */
  showSettings: boolean
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
  const tGroups = useTranslations('Groups')
  const tInfo = useTranslations('Information')

  const none = {
    title: null,
    subtitle: null,
    showBack: false,
    showSettings: true,
    showGroupMenu: false,
  }

  if (pathname === '/groups') return none
  if (pathname === '/groups/create')
    return { ...none, title: tGroups('createGroup'), showBack: true }
  if (pathname === '/settings')
    return {
      ...none,
      title: t('settings'),
      showBack: true,
      showSettings: false,
    }

  const section = pathname.match(/^\/groups\/[^/]+\/([^/]+)/)?.[1] ?? null

  if (section === 'expenses') {
    if (pathname.endsWith('/create'))
      return { ...none, title: tExpense('create'), showBack: true }
    if (pathname.endsWith('/edit'))
      return { ...none, title: tExpense('edit'), showBack: true }
    return {
      ...none,
      title: chrome.name,
      subtitle:
        chrome.participantCount === 0
          ? null
          : `${t('memberCount', { count: chrome.participantCount })} · ${chrome.currency}`,
      showBack: true,
      showGroupMenu: true,
    }
  }

  if (section === 'balances')
    return {
      ...none,
      title: chrome.name,
      subtitle: t('balancesSubtitle'),
      showBack: true,
      showGroupMenu: true,
    }
  if (section === 'stats')
    return {
      ...none,
      title: chrome.name,
      subtitle: t('statsSubtitle'),
      showBack: true,
      showGroupMenu: true,
    }
  if (section === 'activity')
    return {
      ...none,
      title: chrome.name,
      subtitle: t('activitySubtitle'),
      showBack: true,
      showGroupMenu: true,
    }
  if (section === 'information')
    return {
      ...none,
      title: tInfo('title'),
      subtitle: chrome.name,
      showBack: true,
      showGroupMenu: true,
    }
  if (section === 'edit')
    return { ...none, title: t('groupSettingsTitle'), showBack: true }

  return none
}
