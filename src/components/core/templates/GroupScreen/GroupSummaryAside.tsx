'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Button } from '@/components/core/atoms/Button'
import { Card } from '@/components/core/atoms/Card'
import { Money } from '@/components/core/atoms/Money'
import { DivergingBar } from '@/components/core/molecules/DivergingBar'
import { useBalanceList } from '@/hooks/balances/useBalanceList'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const SUGGESTION_LIMIT = 4

/**
 * A companion to the expense list, not a second balances table: the rows carry
 * no test hooks, because the balances screen this links to owns that contract.
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

  const scale = Math.max(
    0,
    ...balances.map((balance) => Math.abs(balance.total)),
  )

  const settleHref = (from: string, to: string, amount: number) =>
    `/groups/${groupId}/expenses/create?reimbursement=yes&from=${from}&to=${to}&amount=${amount}`

  return (
    <div className="flex flex-col gap-3.5">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-body-lg font-extrabold text-foreground">
            {t('title')}
          </h2>
          <Link
            href={`/groups/${groupId}/balances`}
            className="text-body-sm font-bold text-primary-ink hover:underline"
          >
            {t('seeAll')}
          </Link>
        </div>
        <ul className="mt-2 flex flex-col">
          {balances.map((balance) => (
            <li key={balance.participantId} className="py-1.5">
              <div className="flex items-center gap-2">
                <Avatar name={balance.name} size="xs" />
                <span className="min-w-0 flex-1 truncate text-body-sm font-bold text-foreground">
                  {balance.name}
                </span>
                <Money
                  amount={balance.total}
                  currency={currency}
                  locale={locale}
                  tone={balance.total >= 0 ? 'credit' : 'debit'}
                  className="text-body-sm font-extrabold"
                />
              </div>
              <DivergingBar
                total={balance.total}
                scale={scale}
                size="sm"
                className="mt-1"
              />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="text-body-lg font-extrabold text-foreground">
          {t('Reimbursements.title')}
        </h2>
        {isSettled ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            {t('Reimbursements.noImbursements')}
          </p>
        ) : (
          <ul className="mt-1 flex flex-col">
            {reimbursements.slice(0, SUGGESTION_LIMIT).map((reimbursement) => (
              <li
                key={`${reimbursement.from}-${reimbursement.to}`}
                className="flex items-center gap-2 py-2"
              >
                <span aria-hidden className="flex shrink-0 items-center gap-1">
                  <Avatar
                    name={participantName(reimbursement.from)}
                    size="xs"
                  />
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <Avatar name={participantName(reimbursement.to)} size="xs" />
                </span>
                <Money
                  amount={reimbursement.amount}
                  currency={currency}
                  locale={locale}
                  className="min-w-0 flex-1 truncate text-body-sm font-extrabold"
                />
                <Button
                  variant="settle"
                  size="sm"
                  className="min-h-8 px-2.5 text-label-md"
                  asChild
                >
                  <Link
                    href={settleHref(
                      reimbursement.from,
                      reimbursement.to,
                      reimbursement.amount,
                    )}
                  >
                    {t('Reimbursements.markAsPaidShort')}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
