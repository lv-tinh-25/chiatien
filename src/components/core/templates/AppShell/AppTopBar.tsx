'use client'

import { Button } from '@/components/core/atoms/Button'
import { BrandMark } from '@/components/core/templates/AppShell/BrandMark'
import { GroupOverflowMenu } from '@/components/core/templates/AppShell/GroupOverflowMenu'
import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import { Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function AppTopBar({ chrome }: { chrome: GroupChrome }) {
  const t = useTranslations('Nav')

  return (
    <header className="glass-bar fixed inset-x-0 top-0 z-30 hidden h-15 items-center gap-4 px-6 lg:flex">
      <BrandMark />

      {chrome.groupId !== null && (
        <nav
          aria-label={t('groupSections')}
          className="flex min-w-0 items-center gap-2 text-body-md font-semibold text-muted-foreground"
        >
          <span aria-hidden className="text-border">
            /
          </span>
          <Link
            href="/groups"
            className="transition-colors duration-150 ease-out-soft hover:text-primary-ink"
          >
            {t('groups')}
          </Link>
          <span aria-hidden className="text-border">
            /
          </span>
          <span className="truncate font-bold text-foreground">
            {chrome.name}
          </span>
        </nav>
      )}

      <div className="flex-1" />

      {chrome.groupId !== null && (
        <GroupOverflowMenu groupId={chrome.groupId} variant="menu" />
      )}

      <Button variant="outline" size="icon" className="min-h-9.5 w-9.5" asChild>
        <Link href="/settings" aria-label={t('settings')}>
          <Settings aria-hidden />
        </Link>
      </Button>
    </header>
  )
}
