'use client'

import { Button } from '@/components/core/atoms/Button'
import { BrandMark } from '@/components/core/templates/AppShell/BrandMark'
import { GroupOverflowMenu } from '@/components/core/templates/AppShell/GroupOverflowMenu'
import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import type { ShellTitle } from '@/hooks/groups/useShellTitle'
import { ChevronLeft, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function MobileTopBar({
  chrome,
  shellTitle,
}: {
  chrome: GroupChrome
  shellTitle: ShellTitle
}) {
  const t = useTranslations('Nav')
  const router = useRouter()

  return (
    <div className="glass-bar fixed top-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 lg:hidden">
      <div className="flex h-14 items-center gap-2 px-3">
        {shellTitle.showBack && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('back')}
            onClick={() => router.back()}
          >
            <ChevronLeft aria-hidden />
          </Button>
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

        {chrome.groupId === null ? (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings" aria-label={t('settings')}>
              <Settings aria-hidden />
            </Link>
          </Button>
        ) : (
          <GroupOverflowMenu groupId={chrome.groupId} variant="sheet" />
        )}
      </div>
    </div>
  )
}
