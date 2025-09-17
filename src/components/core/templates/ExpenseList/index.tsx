'use client'

import { Button } from '@/components/core/atoms/Button'
import { EmptyState } from '@/components/core/molecules/EmptyState'
import { SearchBar } from '@/components/core/molecules/SearchBar'
import { CreateFromReceipt } from '@/components/core/templates/ExpenseList/CreateFromReceipt'
import { ExpenseCard } from '@/components/core/templates/ExpenseList/ExpenseCard'
import { ExpenseListSkeleton } from '@/components/core/templates/ExpenseList/Skeleton'
import { useExpenseList } from '@/hooks/expenses/useExpenseList'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function ExpenseList({
  receiptExtractEnabled,
}: {
  receiptExtractEnabled: boolean
}) {
  const t = useTranslations('Expenses')
  const {
    groupId,
    group,
    currency,
    locale,
    activeUserId,
    sections,
    isPending,
    isEmpty,
    isSearchMiss,
    setSearch,
    sentinelRef,
    isFetchingNextPage,
  } = useExpenseList()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3.5">
        <h1 className="hidden shrink-0 text-headline-lg text-foreground lg:block">
          {t('title')}
        </h1>
        <div className="min-w-0 flex-1 md:max-w-105">
          <SearchBar
            label={t('searchPlaceholder')}
            placeholder={t('searchPlaceholder')}
            clearLabel={t('searchPlaceholder')}
            onValueChange={setSearch}
          />
        </div>
        {receiptExtractEnabled && currency && (
          <CreateFromReceipt currency={currency} locale={locale} />
        )}
        <Button asChild className="hidden shrink-0 lg:inline-flex">
          <Link href={`/groups/${groupId}/expenses/create`}>
            <Plus aria-hidden />
            {t('create')}
          </Link>
        </Button>
      </div>

      {/* The group name is the page's own heading on a phone, where the shell
          header shows it too; the empty-state spec looks for it here. */}
      <h2 className="sr-only">{group?.name ?? ''}</h2>

      {isPending && <ExpenseListSkeleton />}

      {isEmpty && (
        <EmptyState
          title={t('noExpenses')}
          action={
            <Button asChild className="mt-2">
              <Link href={`/groups/${groupId}/expenses/create`}>
                {t('createFirst')}
              </Link>
            </Button>
          }
        />
      )}

      {isSearchMiss && <EmptyState title={t('noExpenses')} />}

      {currency &&
        sections.map(({ group: section, expenses }) => (
          <section key={section} className="flex flex-col gap-2">
            <h3 className="px-1 text-label-sm tracking-wide text-muted-foreground uppercase">
              {t(`Groups.${section}`)}
            </h3>
            <div className="glass-raised overflow-hidden rounded-card">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  groupId={groupId}
                  currency={currency}
                  locale={locale}
                  activeUserId={activeUserId}
                />
              ))}
            </div>
          </section>
        ))}

      <div ref={sentinelRef} aria-hidden className="h-px" />
      {isFetchingNextPage && (
        <p className="text-center text-body-sm text-muted-foreground">
          <span className="md:hidden">{t('loadMore')}</span>
          <span className="hidden md:inline">{t('loadMoreWide')}</span>
        </p>
      )}
    </div>
  )
}
