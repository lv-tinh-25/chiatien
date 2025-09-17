'use client'

import { toneAt } from '@/components/core/atoms/Avatar/tone'
import { BalanceChip } from '@/components/core/molecules/BalanceChip'
import type { GroupListEntry } from '@/hooks/groups/useGroupList'
import { asLocale } from '@/i18n/locales'
import { groupEmoji, groupToneIndex } from '@/lib/group-emoji'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * One link, no controls. Star, archive and forget live in the group's own
 * overflow menu, which is where every other group-level action already is.
 */
export function GroupCard({ group }: { group: GroupListEntry }) {
  const t = useTranslations('Groups')
  const tNav = useTranslations('Nav')
  const locale = asLocale(useLocale())

  const tone = toneAt(groupToneIndex(group.id))

  const chip = group.balance !== null && (
    <BalanceChip
      amount={group.balance.amount}
      currency={group.balance.currency}
      locale={locale}
      settledLabel={t('settled')}
    />
  )

  return (
    <Link
      href={`/groups/${group.id}/expenses`}
      data-testid="group-card"
      className={cn(
        'glass-raised flex flex-col gap-2.5 rounded-card p-3.5 lg:gap-3 lg:p-4',
        'transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-raised active:translate-y-0 active:duration-75',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span
          aria-hidden
          className={cn(
            'flex size-9.5 items-center justify-center rounded-control border border-white/80 text-lg md:size-10 md:text-xl',
            tone.surface,
          )}
        >
          {groupEmoji(group.id)}
        </span>
        {/* A wide card pairs the chip with the emoji; a narrow one has no
            room, so it drops below the name instead. */}
        <span className="hidden md:block">{chip}</span>
      </span>

      <span className="block min-w-0">
        <span className="block text-headline-sm font-bold text-foreground">
          {group.name}
        </span>
        <span className="mt-0.5 block text-body-sm text-muted-foreground">
          {tNav('memberCount', { count: group.participantCount })} ·{' '}
          {t('expenseCount', { count: group.expenseCount })}
        </span>
      </span>

      <span className="block md:hidden">{chip}</span>
    </Link>
  )
}
