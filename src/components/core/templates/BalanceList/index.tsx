'use client'

import { Card } from '@/components/core/atoms/Card'
import { BalanceRow } from '@/components/core/templates/BalanceList/BalanceRow'
import { ReimbursementRow } from '@/components/core/templates/BalanceList/ReimbursementRow'
import { BalanceListSkeleton } from '@/components/core/templates/BalanceList/Skeleton'
import { useBalanceList } from '@/hooks/balances/useBalanceList'
import { useTranslations } from 'next-intl'

export function BalanceList() {
  const t = useTranslations('Balances')
  const {
    groupId,
    locale,
    currency,
    balances,
    reimbursements,
    participantName,
    activeUserId,
    isPending,
    isSettled,
  } = useBalanceList()

  if (isPending) return <BalanceListSkeleton />
  if (!currency) return null

  const scale = Math.max(
    0,
    ...balances.map((balance) => Math.abs(balance.total)),
  )
  const peers = balances.map((balance) => balance.name)

  /**
   * Settling opens a prefilled reimbursement rather than writing one directly:
   * the payer may want to change the date, attach proof, or split it, and the
   * expense form is where all of that already lives.
   */
  const settleHref = (from: string, to: string, amount: number) =>
    `/groups/${groupId}/expenses/create?reimbursement=yes&from=${from}&to=${to}&amount=${amount}`

  return (
    <div className="flex flex-col gap-4">
      <h1 className="hidden text-headline-lg text-foreground lg:block">
        {t('title')}
      </h1>

      <div className="grid items-start gap-4 *:min-w-0 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))]">
        <Card className="p-4 lg:p-5">
          {/* The bars diverge from a centre axis, so the two directions need
              naming once rather than a legend per row. */}
          <div className="flex items-center justify-between text-label-sm tracking-wide text-muted-foreground uppercase">
            <span>← {t('owing')}</span>
            <span>{t('owed')} →</span>
          </div>
          <ul className="mt-1.5 flex flex-col">
            {balances.map((balance) => (
              <BalanceRow
                key={balance.participantId}
                name={balance.name}
                label={
                  balance.participantId === activeUserId
                    ? t('you', { name: balance.name })
                    : balance.name
                }
                peers={peers}
                total={balance.total}
                currency={currency}
                locale={locale}
                scale={scale}
              />
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-2.5">
          <h2 className="px-1 text-body-md font-bold text-muted-foreground">
            {t('Reimbursements.title', { count: reimbursements.length })}
          </h2>
          {isSettled ? (
            <Card className="p-4 text-body-md text-muted-foreground">
              {t('Reimbursements.noImbursements')}
            </Card>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {reimbursements.map((reimbursement) => (
                <ReimbursementRow
                  key={`${reimbursement.from}-${reimbursement.to}`}
                  fromId={reimbursement.from}
                  toId={reimbursement.to}
                  fromName={participantName(reimbursement.from)}
                  toName={participantName(reimbursement.to)}
                  peers={peers}
                  amount={reimbursement.amount}
                  currency={currency}
                  locale={locale}
                  settleHref={settleHref(
                    reimbursement.from,
                    reimbursement.to,
                    reimbursement.amount,
                  )}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
