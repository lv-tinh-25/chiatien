'use client'

import { Button } from '@/components/core/atoms/Button'
import { Card } from '@/components/core/atoms/Card'
import type { RecentGroup } from '@/lib/recent-groups'
import { Archive, ArchiveRestore, Star, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type GroupCardProps = {
  group: RecentGroup
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

  return (
    <Card className="flex items-center gap-1 p-2 pl-4">
      <Link
        href={`/groups/${group.id}/expenses`}
        className="flex min-h-touch-min flex-1 items-center text-headline-sm text-foreground"
      >
        {group.name}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        aria-label={t('starred')}
        aria-pressed={starred}
        onClick={onToggleStar}
        className={starred ? 'text-accent' : 'text-muted-foreground'}
      >
        <Star aria-hidden fill={starred ? 'currentColor' : 'none'} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={archived ? t('unarchive') : t('archive')}
        onClick={onToggleArchive}
        className="text-muted-foreground"
      >
        {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={t('removeRecent')}
        onClick={onForget}
        className="text-muted-foreground"
      >
        <Trash2 aria-hidden />
      </Button>
    </Card>
  )
}
