'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * Whose balance every "you owe" chip in the app is talking about. It sits in
 * the sidebar because the answer changes what half the numbers on screen mean.
 */
export function ActiveUserCard({ chrome }: { chrome: GroupChrome }) {
  const t = useTranslations('Nav')
  if (chrome.groupId === null || chrome.activeUserName === null) return null

  return (
    <div className="glass-flush flex flex-col gap-1.5 rounded-control p-3">
      <span className="text-label-sm tracking-wider text-muted-foreground uppercase">
        {t('activeUser')}
      </span>
      <div className="flex items-center gap-2">
        <Avatar name={chrome.activeUserName} size="sm" />
        <span className="min-w-0 flex-1 truncate text-body-md font-bold text-foreground">
          {chrome.activeUserName}
        </span>
        <Link
          href={`/groups/${chrome.groupId}/settings`}
          className="text-body-sm font-bold text-primary-ink hover:underline"
        >
          {t('changeActiveUser')}
        </Link>
      </div>
    </div>
  )
}
