'use client'

import { NAV_ICONS } from '@/components/core/templates/AppShell/navIcons'
import type { NavItem } from '@/components/core/templates/AppShell/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function BottomNav({ items }: { items: NavItem[] }) {
  const t = useTranslations('Nav')

  return (
    <nav
      aria-label={t('groupSections')}
      className="glass-modal fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 rounded-none border-x-0 border-b-0 px-2 pt-1.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <ul className="flex">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.key]
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'flex min-h-touch-min flex-col items-center justify-center gap-1 rounded-control text-label-sm',
                  'transition-colors duration-150 ease-out-soft active:scale-[0.96]',
                  item.active
                    ? 'font-extrabold text-primary-ink'
                    : 'font-semibold text-muted-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden />
                {t(item.key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
