'use client'

import { NAV_ICONS } from '@/components/core/templates/AppShell/navIcons'
import { ActiveUserCard } from '@/components/core/templates/AppShell/ActiveUserCard'
import type { GroupChrome } from '@/hooks/groups/useGroupChrome'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function Sidebar({ chrome }: { chrome: GroupChrome }) {
  const t = useTranslations('Nav')

  return (
    <nav
      aria-label={t('groupSections')}
      className="glass-flush fixed top-15 bottom-0 left-0 z-20 hidden w-62 flex-col gap-1.5 rounded-none border-0 border-r border-white/70 p-3.5 pt-5 lg:flex"
    >
      <div className="flex items-center gap-3 px-2.5 pt-2.5 pb-4">
        <span
          aria-hidden
          className="glass-flush flex size-10.5 items-center justify-center rounded-control text-xl"
        >
          {chrome.emoji}
        </span>
        <div className="min-w-0">
          <div className="truncate text-body-md font-extrabold text-foreground">
            {chrome.name}
          </div>
          <div className="truncate text-label-sm font-semibold text-muted-foreground">
            {t('memberCount', { count: chrome.participantCount })} ·{' '}
            {chrome.currency}
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {chrome.items.map((item) => {
          const Icon = NAV_ICONS[item.key]
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'flex min-h-touch-min items-center gap-3 rounded-control px-3 text-body-md transition-colors duration-150 ease-out-soft',
                  item.active
                    ? 'glass-raised font-extrabold text-primary-ink'
                    : 'font-semibold text-foreground/80 hover:bg-foreground/5',
                )}
              >
                <Icon className="size-5" aria-hidden />
                {t(item.key)}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex-1" />
      <ActiveUserCard chrome={chrome} />
    </nav>
  )
}
