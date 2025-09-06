'use client'

import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export type ShellTitle = {
  /** Absent on the group list, where the brand mark stands in for a title. */
  title: string | null
  subtitle: string | null
  showBack: boolean
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

  const none = { title: null, subtitle: null, showBack: false }

  if (pathname === '/groups') return none
  if (pathname === '/groups/create')
    return { title: tGroups('createGroup'), subtitle: null, showBack: true }
  if (pathname === '/settings')
    return { title: t('settings'), subtitle: null, showBack: true }

  const section = pathname.match(/^\/groups\/[^/]+\/([^/]+)/)?.[1] ?? null

  if (section === 'expenses') {
    if (pathname.endsWith('/create'))
      return { title: tExpense('create'), subtitle: null, showBack: true }
    if (pathname.endsWith('/edit'))
      return { title: tExpense('edit'), subtitle: null, showBack: true }
    return {
      title: chrome.name,
      subtitle:
        chrome.participantCount === 0
          ? null
          : `${t('memberCount', { count: chrome.participantCount })} · ${chrome.currency}`,
      showBack: true,
    }
  }

  if (section === 'balances')
    return {
      title: chrome.name,
      subtitle: t('balancesSubtitle'),
      showBack: true,
    }
  if (section === 'stats')
    return { title: chrome.name, subtitle: t('statsSubtitle'), showBack: true }
  if (section === 'activity')
    return {
      title: chrome.name,
      subtitle: t('activitySubtitle'),
      showBack: true,
    }
  if (section === 'information')
    return { title: tInfo('title'), subtitle: chrome.name, showBack: true }
  if (section === 'edit')
    return { title: t('groupSettingsTitle'), subtitle: null, showBack: true }

  return none
}
