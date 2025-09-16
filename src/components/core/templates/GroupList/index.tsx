'use client'

import { Button } from '@/components/core/atoms/Button'
import { EmptyState } from '@/components/core/molecules/EmptyState'
import { AddGroupByUrl } from '@/components/core/templates/GroupList/AddGroupByUrl'
import { ArchivedGroupRow } from '@/components/core/templates/GroupList/ArchivedGroupRow'
import { GlobalBalanceCard } from '@/components/core/templates/GroupList/GlobalBalanceCard'
import { GroupCard } from '@/components/core/templates/GroupList/GroupCard'
import { GroupSection } from '@/components/core/templates/GroupList/GroupSection'
import { GroupListSkeleton } from '@/components/core/templates/GroupList/Skeleton'
import { useGroupList } from '@/hooks/groups/useGroupList'
import { Plus, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function GroupList() {
  const t = useTranslations('Groups')
  const { status, starred, recent, archived, balances } = useGroupList()

  return (
    <div className="flex flex-col gap-5 *:min-w-0 lg:grid lg:grid-cols-[repeat(2,minmax(0,1fr))] lg:items-start lg:gap-4">
      <header className="hidden items-end justify-between gap-4 lg:col-span-2 lg:flex">
        <div>
          <h1 className="text-headline-lg text-foreground">{t('myGroups')}</h1>
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

      {/* Directly under the balance card on a phone: someone who was sent a
          link opens the app for this field alone, and at the foot of the list
          they had to scroll past every group they already have. On a desktop
          the grid puts it beside the balance card instead. */}
      <div className="order-1 lg:order-none">
        <AddGroupByUrl />
      </div>

      {status === 'pending' && <GroupListSkeleton className="order-2" />}

      {status === 'empty' && (
        <div className="order-2 lg:col-span-2">
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
          {starred.length > 0 && (
            <GroupSection
              title={t('starred')}
              icon={
                <Star
                  className="size-3.5 fill-accent text-accent"
                  aria-hidden
                />
              }
              className="order-3 lg:col-span-2"
            >
              {starred.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </GroupSection>
          )}

          {recent.length > 0 && (
            <GroupSection title={t('recent')} className="order-4 lg:col-span-2">
              {recent.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </GroupSection>
          )}

          {archived.length > 0 && (
            <GroupSection
              title={t('archived')}
              layout="rows"
              className="order-5 lg:col-span-2"
            >
              {archived.map((group) => (
                <ArchivedGroupRow key={group.id} group={group} />
              ))}
            </GroupSection>
          )}
        </>
      )}
    </div>
  )
}
