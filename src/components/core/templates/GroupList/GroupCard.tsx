'use client'

import { Card } from '@/components/core/atoms/Card'
import { BalanceChip } from '@/components/core/molecules/BalanceChip'
import { GroupCardMenu } from '@/components/core/templates/GroupList/GroupCardMenu'
import type { GroupListEntry } from '@/hooks/groups/useGroupList'
import { asLocale } from '@/i18n/locales'
import { groupEmoji } from '@/lib/group-emoji'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

type GroupCardProps = {
  group: GroupListEntry
  starred: boolean
  archived: boolean
  onToggleStar: () => void
  onToggleArchive: () => void
  onForget: () => void
}

export function GroupCard({
  group,
  starred,
  archived,
  onToggleStar,
  onToggleArchive,
  onForget,
}: GroupCardProps) {
  const t = useTranslations('Groups')
  const tNav = useTranslations('Nav')
  const locale = asLocale(useLocale())

  return (
    <Card
      interactive
      data-testid="group-card"
      className="relative flex flex-col gap-3 p-4 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="glass-flush flex size-10 items-center justify-center rounded-control text-xl"
        >
          {groupEmoji(group.id)}
        </span>
        <div className="relative z-10 flex items-center gap-1">
          {group.balance !== null && (
            <BalanceChip
              amount={group.balance.amount}
              currency={group.balance.currency}
              locale={locale}
              settledLabel={t('settled')}
            />
          )}
          <GroupCardMenu
            starred={starred}
            archived={archived}
            onToggleStar={onToggleStar}
            onToggleArchive={onToggleArchive}
            onForget={onForget}
          />
        </div>
      </div>

      <div className="min-w-0">
        {/* The link stretches over the card so the whole tile is one target,
            while the menu button above keeps its own hit area by sitting later
            in the stacking order. */}
        <Link
          href={`/groups/${group.id}/expenses`}
          className="text-headline-sm font-bold text-foreground outline-none before:absolute before:inset-0 before:rounded-card before:content-['']"
        >
          {group.name}
        </Link>
        <p className="mt-0.5 text-body-sm text-muted-foreground">
          {tNav('memberCount', { count: group.participantCount })} ·{' '}
          {t('expenseCount', { count: group.expenseCount })}
        </p>
      </div>
    </Card>
  )
}
