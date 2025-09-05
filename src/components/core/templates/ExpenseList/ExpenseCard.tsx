'use client'

import { CategoryIcon } from '@/components/core/atoms/CategoryIcon'
import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { getCurrency } from '@/lib/currency'
import { getParticipantShare } from '@/lib/shares'
import { cn, formatDateOnly } from '@/lib/utils'
import type { AppRouterOutput } from '@/trpc/routers/_app'
import { Paperclip } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Fragment } from 'react'

type Expense = AppRouterOutput['groups']['expenses']['list']['expenses'][number]

type ExpenseCardProps = {
  expense: Expense
  groupId: string
  currency: Currency
  locale: Locale
  participantCount: number
  /** Participant ids in the group's own order. */
  participantOrder: string[]
  activeUserId: string | null
}

function PaidForNames({
  expense,
  participantCount,
  participantOrder,
}: {
  expense: Expense
  participantCount: number
  participantOrder: string[]
}) {
  const t = useTranslations('ExpenseCard')

  if (expense.paidFor.length === participantCount && participantCount >= 4) {
    return <strong>{t('everyone')}</strong>
  }

  // paidFor is fetched without an orderBy, so the database is free to return
  // the rows in any order; the group's own participant order is the one people
  // recognise.
  const ordered = [...expense.paidFor].sort(
    (a, b) =>
      participantOrder.indexOf(a.participant.id) -
      participantOrder.indexOf(b.participant.id),
  )

  return (
    <>
      {ordered.map((paidFor, index) => (
        <Fragment key={paidFor.participant.id}>
          {index !== 0 && ', '}
          <strong>{paidFor.participant.name}</strong>
        </Fragment>
      ))}
    </>
  )
}

export function ExpenseCard({
  expense,
  groupId,
  currency,
  locale,
  participantCount,
  participantOrder,
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

  return (
    <Link
      href={`/groups/${groupId}/expenses/${expense.id}/edit`}
      data-testid="expense-card"
      data-expense-id={expense.id}
      className={cn(
        'flex items-start gap-3 rounded-card border border-border bg-card p-3 shadow-card',
        expense.isReimbursement && 'italic',
      )}
    >
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-control bg-muted text-muted-foreground">
        <CategoryIcon category={expense.category} className="size-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-headline-sm text-foreground">
          {expense.title}
        </span>
        <span className="block text-body-sm text-muted-foreground">
          {t.rich(expense.amount > 0 ? 'paidBy' : 'receivedBy', {
            strong: (chunks) => <strong>{chunks}</strong>,
            paidBy: expense.paidBy.name,
            paidFor: () => (
              <PaidForNames
                expense={expense}
                participantCount={participantCount}
                participantOrder={participantOrder}
              />
            ),
            forCount: expense.paidFor.length,
          })}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <Money
          amount={expense.amount}
          currency={currency}
          locale={locale}
          className={cn(
            'text-numeric-table-md',
            expense.isReimbursement ? 'font-normal italic' : '',
          )}
        />
        {original && (
          <Money
            amount={original.amount}
            currency={original.currency}
            locale={locale}
            className="text-body-sm text-muted-foreground"
          />
        )}
        {activeUserId !== null &&
          (involved ? (
            <span className="flex items-baseline gap-1 text-body-sm">
              <span className="text-muted-foreground">{t('yourBalance')}</span>
              <Money
                amount={balance}
                currency={currency}
                locale={locale}
                tone={balance >= 0 ? 'credit' : 'debit'}
              />
            </span>
          ) : (
            <span className="text-body-sm text-muted-foreground">
              {t('notInvolved')}
            </span>
          ))}
        <span className="flex items-center gap-2 text-body-sm text-muted-foreground">
          {expense._count.documents > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="size-3.5" aria-hidden />
              {expense._count.documents}
            </span>
          )}
          {formatDateOnly(expense.expenseDate, locale, { dateStyle: 'medium' })}
        </span>
      </span>
    </Link>
  )
}
