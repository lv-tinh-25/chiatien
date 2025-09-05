import type { NavItem } from '@/components/core/templates/AppShell/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  BarChart3,
  History,
  Info,
  Receipt,
  Scale,
  Settings,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const ICONS = {
  expenses: Receipt,
  balances: Scale,
  stats: BarChart3,
  activity: History,
}

const LINK =
  'flex min-h-touch-min items-center gap-3 rounded-control px-3 transition-colors duration-150 ease-out-soft'

export function Sidebar({
  items,
  groupId,
}: {
  items: NavItem[]
  groupId: string
}) {
  const t = useTranslations('Nav')
  const tApp = useTranslations('App')
  const tForm = useTranslations('GroupForm')

  return (
    <nav
      aria-label={t('groupSections')}
      className="glass-float fixed top-4 bottom-4 left-4 z-30 hidden w-60 flex-col rounded-card p-3 lg:flex"
    >
      <span className="px-3 pt-2 pb-4 text-headline-md text-primary">
        {tApp('name')}
      </span>

      <Link
        href="/groups"
        className={cn(LINK, 'mb-3 text-body-md text-muted-foreground hover:text-foreground')}
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('backToGroups')}
      </Link>

      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = ICONS[item.key]
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  LINK,
                  'relative text-body-lg',
                  item.active
                    ? 'glass-flush font-semibold text-primary'
                    : 'text-foreground hover:bg-foreground/5',
                )}
              >
                {item.active && (
                  <span
                    aria-hidden
                    className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                  />
                )}
                <Icon className="size-5" aria-hidden />
                {t(item.key)}
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            href={`/groups/${groupId}/information`}
            className={cn(LINK, 'text-body-lg text-foreground hover:bg-foreground/5')}
          >
            <Info className="size-5" aria-hidden />
            {tForm('InformationField.label')}
          </Link>
        </li>
      </ul>

      <Link
        href="/settings"
        className={cn(
          LINK,
          'mt-auto text-body-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
        )}
      >
        <Settings className="size-5" aria-hidden />
        {t('settings')}
      </Link>
    </nav>
  )
}
