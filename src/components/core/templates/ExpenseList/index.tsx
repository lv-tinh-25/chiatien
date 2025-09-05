'use client'

import { Button } from '@/components/core/atoms/Button'
import { EmptyState } from '@/components/core/molecules/EmptyState'
import { SearchBar } from '@/components/core/molecules/SearchBar'
import { CreateFromReceipt } from '@/components/core/templates/ExpenseList/CreateFromReceipt'
import { ExpenseCard } from '@/components/core/templates/ExpenseList/ExpenseCard'
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
    currency,
    locale,
    activeUserId,
    participantCount,
    participantOrder,
    sections,
    isPending,
    isEmpty,
    isSearchMiss,
    setSearch,
    sentinelRef,
    isFetchingNextPage,
  } = useExpenseList()

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
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
      </div>

      {isPending && (
        <p className="text-body-md text-muted-foreground">{t('title')}…</p>
      )}

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
        sections.map(({ group, expenses }) => (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="text-label-md tracking-wide text-muted-foreground uppercase">
              {t(`Groups.${group}`)}
            </h2>
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                groupId={groupId}
                currency={currency}
                locale={locale}
                participantCount={participantCount}
                participantOrder={participantOrder}
                activeUserId={activeUserId}
              />
            ))}
          </section>
        ))}

      <div ref={sentinelRef} aria-hidden className="h-px" />
      {isFetchingNextPage && (
        <p className="text-center text-body-sm text-muted-foreground">
          {t('title')}…
        </p>
      )}

      <Button
        asChild
        size="lg"
        className="fixed right-4 bottom-[calc(var(--spacing-thumb-safe)+0.75rem)] shadow-action lg:static lg:self-start lg:shadow-none"
      >
        <Link href={`/groups/${groupId}/expenses/create`}>
          <Plus aria-hidden />
          {t('create')}
        </Link>
      </Button>
    </div>
  )
}
