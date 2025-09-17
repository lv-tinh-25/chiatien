'use client'

import type { GroupListEntry } from '@/hooks/groups/useGroupList'
import { groupEmoji } from '@/lib/group-emoji'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * An archived group is still reachable but no longer competing for attention,
 * so it collapses from a card to one muted line.
 */
export function ArchivedGroupRow({ group }: { group: GroupListEntry }) {
  const t = useTranslations('Groups')

  return (
    <Link
      href={`/groups/${group.id}/expenses`}
      data-testid="group-card"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-control border border-white/70 bg-card/40 px-3.5 py-3 backdrop-blur-md md:w-fit',
        'text-muted-foreground transition-colors duration-150 ease-out-soft hover:bg-card/70',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      )}
    >
      <span aria-hidden className="text-lg opacity-70">
        {groupEmoji(group.id)}
      </span>
      <span className="min-w-0 flex-1 truncate text-body-md font-semibold">
        {group.name}
      </span>
      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-label-sm font-semibold">
        {t('settledShort')}
      </span>
    </Link>
  )
}
