'use client'

import { Button } from '@/components/core/atoms/Button'
import { EmptyState } from '@/components/core/molecules/EmptyState'
import { AddGroupByUrl } from '@/components/core/templates/GroupList/AddGroupByUrl'
import { GlobalBalanceCard } from '@/components/core/templates/GroupList/GlobalBalanceCard'
import { GroupCard } from '@/components/core/templates/GroupList/GroupCard'
import { GroupSection } from '@/components/core/templates/GroupList/GroupSection'
import { useGroupList } from '@/hooks/groups/useGroupList'
import type { RecentGroup } from '@/lib/recent-groups'
import { trpc } from '@/trpc/client'
import { Plus, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function GroupList() {
  const t = useTranslations('Groups')
  const tNav = useTranslations('Nav')
  const {
    status,
    starred,
    recent,
    archived,
    balances,
    toggleStar,
    toggleArchive,
    forget,
    visit,
    isStarred,
    isArchived,
  } = useGroupList()
  const utils = trpc.useUtils()

  const addByUrl = async (groupId: string) => {
    const details = await utils.groups.get.fetch({ groupId }).catch(() => null)
    if (!details?.group) return false
    visit({ id: details.group.id, name: details.group.name })
    return true
  }

  const renderSection = (title: string, groups: RecentGroup[]) =>
    groups.length === 0 ? null : (
      <GroupSection key={title} title={title}>
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            starred={isStarred(group.id)}
            archived={isArchived(group.id)}
            onToggleStar={() => toggleStar(group.id)}
            onToggleArchive={() => toggleArchive(group.id)}
            onForget={() => forget(group)}
          />
        ))}
      </GroupSection>
    )

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-headline-lg text-foreground">{t('myGroups')}</h1>
        <nav
          aria-label={tNav('mainSections')}
          className="flex items-center gap-1"
        >
          <Button asChild>
            <Link href="/groups/create">
              <Plus aria-hidden />
              {t('createGroup')}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings" aria-label={tNav('settings')}>
              <Settings aria-hidden />
            </Link>
          </Button>
        </nav>
      </div>

      <GlobalBalanceCard balances={balances} />

      {status === 'pending' && (
        <p className="text-body-md text-muted-foreground">
          {t('loadingRecent')}
        </p>
      )}

      {status === 'empty' && (
        <EmptyState
          title={t('NoRecent.description')}
          description={t('NoRecent.orAsk')}
          action={
            <Button asChild className="mt-2">
              <Link href="/groups/create">{t('NoRecent.create')}</Link>
            </Button>
          }
        />
      )}

      {status === 'ready' && (
        <>
          {renderSection(t('starred'), starred)}
          {renderSection(t('recent'), recent)}
          {renderSection(t('archived'), archived)}
        </>
      )}

      <AddGroupByUrl onAdd={addByUrl} />
    </div>
  )
}
