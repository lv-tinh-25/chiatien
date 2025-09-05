import type { NavItem } from '@/components/core/templates/AppShell/navigation'
import { cn } from '@/lib/utils'
import { BarChart3, History, Receipt, Scale } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const ICONS = {
  expenses: Receipt,
  balances: Scale,
  stats: BarChart3,
  activity: History,
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const t = useTranslations('Nav')

  return (
    <nav
      aria-label={t('groupSections')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-[1080px]">
        {items.map((item) => {
          const Icon = ICONS[item.key]
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'flex min-h-touch-min flex-col items-center justify-center gap-0.5 py-2 text-label-sm',
                  item.active ? 'text-primary' : 'text-muted-foreground',
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
