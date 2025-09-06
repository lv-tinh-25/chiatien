'use client'

import { Button } from '@/components/core/atoms/Button'
import { EmptyState } from '@/components/core/molecules/EmptyState'
import { AddGroupByUrl } from '@/components/core/templates/GroupList/AddGroupByUrl'
import { GlobalBalanceCard } from '@/components/core/templates/GroupList/GlobalBalanceCard'
import { GroupCard } from '@/components/core/templates/GroupList/GroupCard'
import { GroupSection } from '@/components/core/templates/GroupList/GroupSection'
import type { GroupListEntry } from '@/hooks/groups/useGroupList'
import { useGroupList } from '@/hooks/groups/useGroupList'
import { trpc } from '@/trpc/client'
import { Plus, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function GroupList() {
  const t = useTranslations('Groups')
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

  const renderSection = (
    title: string,
    groups: GroupListEntry[],
    icon?: ReactNode,
  ) =>
    groups.length === 0 ? null : (
      <GroupSection key={title} title={title} icon={icon} className="lg:col-span-2">
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
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[repeat(2,minmax(0,1fr))] lg:items-start lg:gap-4">
      <header className="hidden items-end justify-between gap-4 lg:col-span-2 lg:flex">
        <div>
          <h1 className="text-headline-lg font-extrabold text-foreground">
            {t('myGroups')}
          </h1>
          <p className="mt-1 text-body-md text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button asChild>
          <Link href="/groups/create">
            <Plus aria-hidden />
            {t('createGroup')}
          </Link>
        </Button>
      </header>

      <GlobalBalanceCard balances={balances} />

      {/* One instance only: a second copy for the other breakpoint would give
          the page two tablists and two inputs with the same name. */}
      <div className="order-last lg:order-none">
        <AddGroupByUrl onAdd={addByUrl} />
      </div>

      {status === 'pending' && (
        <p className="text-body-md text-muted-foreground lg:col-span-2">
          {t('loadingRecent')}
        </p>
      )}

      {status === 'empty' && (
        <div className="lg:col-span-2">
          <EmptyState
            title={t('NoRecent.description')}
            description={t('NoRecent.orAsk')}
            action={
              <Button asChild className="mt-2">
                <Link href="/groups/create">{t('NoRecent.create')}</Link>
              </Button>
            }
          />
        </div>
      )}

      {status === 'ready' && (
        <>
          {renderSection(
            t('starred'),
            starred,
            <Star className="size-3.5 fill-accent text-accent" aria-hidden />,
          )}
          {renderSection(t('recent'), recent)}
          {renderSection(t('archived'), archived)}
        </>
      )}
    </div>
  )
}
