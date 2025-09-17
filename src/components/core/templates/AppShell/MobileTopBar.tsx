'use client'

import { BackButton } from '@/components/core/atoms/BackButton'
import { BrandMark } from '@/components/core/templates/AppShell/BrandMark'
import { GroupOverflowMenu } from '@/components/core/templates/AppShell/GroupOverflowMenu'
import { LanguageSwitch } from '@/components/core/templates/AppShell/LanguageSwitch'
import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import type { ShellTitle } from '@/hooks/groups/useShellTitle'
import { useTranslations } from 'next-intl'

export function MobileTopBar({
  chrome,
  shellTitle,
}: {
  chrome: GroupChrome
  shellTitle: ShellTitle
}) {
  const t = useTranslations('Nav')

  return (
    <div className="solid-bar fixed inset-x-0 top-0 z-30 border-b lg:hidden">
      <div className="flex h-14 items-center gap-2 px-3">
        {shellTitle.back !== null && (
          <BackButton href={shellTitle.back} tone="bar" />
        )}

        {shellTitle.title === null ? (
          <BrandMark className="px-1" />
        ) : (
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <span className="truncate text-headline-sm font-bold text-foreground">
              {shellTitle.title}
            </span>
            {shellTitle.subtitle !== null && (
              <span className="truncate text-label-sm font-medium text-muted-foreground">
                {shellTitle.subtitle}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        <nav
          aria-label={t('mainSections')}
          className="flex shrink-0 items-center"
        >
          {chrome.groupId !== null && shellTitle.showGroupMenu && (
            <GroupOverflowMenu groupId={chrome.groupId} variant="sheet" />
          )}
          <LanguageSwitch variant="single" className="ml-1" />
        </nav>
      </div>
    </div>
  )
}
