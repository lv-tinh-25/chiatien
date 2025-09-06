'use client'

import { CategoryEmoji } from '@/components/core/atoms/CategoryEmoji'
import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { getCurrency } from '@/lib/currency'
import { formatExpenseDate } from '@/lib/expense-date'
import { getParticipantShare } from '@/lib/shares'
import { cn, formatCurrency } from '@/lib/utils'
import type { AppRouterOutput } from '@/trpc/routers/_app'
import { Paperclip } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type Expense = AppRouterOutput['groups']['expenses']['list']['expenses'][number]

type ExpenseCardProps = {
  expense: Expense
  groupId: string
  currency: Currency
  locale: Locale
  activeUserId: string | null
}

export function ExpenseCard({
  expense,
  groupId,
  currency,
  locale,
  activeUserId,
}: ExpenseCardProps) {
  const t = useTranslations('ExpenseCard')

  const share = activeUserId
    ? getParticipantShare(activeUserId, {
        id: expense.id,
        amount: expense.amount,
        splitMode: expense.splitMode,
        paidFor: expense.paidFor.map(({ participant, shares }) => ({
          participantId: participant.id,
          shares,
        })),
      })
    : 0
  // Shown alongside the group-currency figure so a converted expense records
  // both what settled the balance and what actually moved.
  const original =
    expense.originalAmount !== null &&
    expense.originalCurrency !== null &&
    expense.originalCurrency !== currency.code
      ? {
          amount: expense.originalAmount,
          currency: getCurrency(expense.originalCurrency, locale),
        }
      : null

  const paid = activeUserId === expense.paidBy.id ? expense.amount : 0
  const balance = paid - share
  const involved = share !== 0 || paid !== 0

  const summaryKey = expense.amount > 0 ? 'paidBySummary' : 'receivedBySummary'
  const summaryValues = {
    paidBy: expense.paidBy.name,
    count: expense.paidFor.length,
  }
  const summary = expense.isReimbursement
    ? t('reimbursement')
    : t(summaryKey, summaryValues)
  const summaryWide = expense.isReimbursement
    ? t('reimbursement')
    : t(`${summaryKey}Wide`, summaryValues)

  return (
    <Link
      href={`/groups/${groupId}/expenses/${expense.id}/edit`}
      data-testid="expense-card"
      data-expense-id={expense.id}
      className={cn(
        'glass-contain flex w-full items-center gap-3 px-3.5 py-3 lg:gap-3.5 lg:px-4.5',
        'transition-colors duration-150 ease-out-soft hover:bg-card',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:-outline-offset-2 focus-visible:outline-none',
      )}
    >
      <CategoryEmoji
        categoryId={expense.category?.id ?? 0}
        size="md"
        className="lg:size-11"
      />

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-headline-sm font-bold text-foreground',
            expense.isReimbursement && 'font-semibold italic',
          )}
        >
          {expense.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-body-sm text-muted-foreground">
          <span className="truncate lg:hidden">{summary}</span>
          <span className="hidden truncate lg:inline">{summaryWide}</span>
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">
            {formatExpenseDate(expense.expenseDate, locale)}
          </span>
          {expense._count.documents > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="size-3.5" aria-hidden />
              {expense._count.documents}
            </span>
          )}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1">
        <Money
          amount={expense.amount}
          currency={currency}
          locale={locale}
          className={cn(
            'text-numeric-table-lg font-extrabold whitespace-nowrap',
            expense.isReimbursement && 'font-semibold italic',
          )}
        />
        {original && (
          <Money
            amount={original.amount}
            currency={original.currency}
            locale={locale}
            className="text-body-sm whitespace-nowrap text-muted-foreground"
          />
        )}
        {activeUserId !== null && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-label-sm whitespace-nowrap tabular',
              !involved && 'bg-muted text-muted-foreground',
              involved &&
                (balance >= 0
                  ? 'bg-credit-subtle text-credit'
                  : 'bg-debit-subtle text-debit'),
            )}
          >
            {involved
              ? t(balance >= 0 ? 'credit' : 'debit', {
                  amount: formatCurrency(currency, Math.abs(balance), locale),
                })
              : t('notInvolved')}
          </span>
        )}
      </span>
    </Link>
  )
}
