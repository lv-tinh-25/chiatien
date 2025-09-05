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

export function Sidebar({
  items,
  groupId,
}: {
  items: NavItem[]
  groupId: string
}) {
  const t = useTranslations('Nav')
  const tForm = useTranslations('GroupForm')

  return (
    <nav
      aria-label={t('groupSections')}
      className="hidden w-60 shrink-0 flex-col border-r border-border bg-card p-3 lg:flex"
    >
      <Link
        href="/groups"
        className="mb-4 inline-flex min-h-touch-min items-center gap-2 rounded-control px-3 text-body-md text-muted-foreground hover:bg-muted"
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
                  'flex min-h-touch-min items-center gap-3 rounded-control px-3 text-body-lg',
                  item.active
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <Icon className="size-5" aria-hidden />
                {t(item.key)}
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            href={`/groups/${groupId}/information`}
            className="flex min-h-touch-min items-center gap-3 rounded-control px-3 text-body-lg text-foreground hover:bg-muted"
          >
            <Info className="size-5" aria-hidden />
            {tForm('InformationField.label')}
          </Link>
        </li>
      </ul>

      <Link
        href="/settings"
        className="mt-auto flex min-h-touch-min items-center gap-3 rounded-control px-3 text-body-md text-muted-foreground hover:bg-muted"
      >
        <Settings className="size-5" aria-hidden />
        {t('settings')}
      </Link>
    </nav>
  )
}
