'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/atoms/Card'
import { Money } from '@/components/core/atoms/Money'
import { useBalanceList } from '@/hooks/balances/useBalanceList'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const SUGGESTION_LIMIT = 3

/**
 * A companion to whichever screen is open, not a second balances table: the
 * rows carry no test hooks and no settle action, because both of those belong
 * to the balances screen this links to.
 */
export function GroupSummaryAside() {
  const t = useTranslations('Balances')
  const {
    groupId,
    locale,
    currency,
    balances,
    reimbursements,
    participantName,
    isPending,
    isSettled,
  } = useBalanceList()

  if (isPending || !currency) return null

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-headline-sm">
            <Link
              href={`/groups/${groupId}/balances`}
              className="transition-colors duration-150 ease-out-soft hover:text-primary"
            >
              {t('title')}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2.5">
            {balances.map((balance) => (
              <li key={balance.participantId} className="flex items-center gap-2.5">
                <Avatar name={balance.name} size="sm" />
                <span className="min-w-0 flex-1 truncate text-body-md text-foreground">
                  {balance.name}
                </span>
                <Money
                  amount={balance.total}
                  currency={currency}
                  locale={locale}
                  tone={balance.total >= 0 ? 'credit' : 'debit'}
                  className="text-numeric-table-md"
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-headline-sm">
            {t('Reimbursements.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSettled ? (
            <p className="text-body-md text-muted-foreground">
              {t('Reimbursements.noImbursements')}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {reimbursements.slice(0, SUGGESTION_LIMIT).map((reimbursement) => (
                <li
                  key={`${reimbursement.from}-${reimbursement.to}`}
                  className="flex flex-col gap-1"
                >
                  <span className="flex items-center gap-1.5 text-body-md text-foreground">
                    <span className="min-w-0 truncate">
                      {participantName(reimbursement.from)}
                    </span>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0 truncate">
                      {participantName(reimbursement.to)}
                    </span>
                  </span>
                  <Money
                    amount={reimbursement.amount}
                    currency={currency}
                    locale={locale}
                    className="text-numeric-table-md"
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
