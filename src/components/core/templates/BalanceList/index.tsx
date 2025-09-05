'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { BalanceRow } from '@/components/core/templates/BalanceList/BalanceRow'
import { ReimbursementRow } from '@/components/core/templates/BalanceList/ReimbursementRow'
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
    isPending,
    isSettled,
  } = useBalanceList()

  if (isPending || !currency) return null

  const scale = Math.max(0, ...balances.map((balance) => Math.abs(balance.total)))

  /**
   * Settling opens a prefilled reimbursement rather than writing one directly:
   * the payer may want to change the date, attach proof, or split it, and the
   * expense form is where all of that already lives.
   */
  const settleHref = (from: string, to: string, amount: number) =>
    `/groups/${groupId}/expenses/create?reimbursement=yes&from=${from}&to=${to}&amount=${amount}`

  return (
    <div className="flex flex-col gap-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col">
            {balances.map((balance) => (
              <BalanceRow
                key={balance.participantId}
                name={balance.name}
                total={balance.total}
                currency={currency}
                locale={locale}
                scale={scale}
              />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Reimbursements.title')}</CardTitle>
          <CardDescription>{t('Reimbursements.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSettled ? (
            <p className="text-body-md text-muted-foreground">
              {t('Reimbursements.noImbursements')}
            </p>
          ) : (
            <ul className="flex flex-col">
              {reimbursements.map((reimbursement) => (
                <ReimbursementRow
                  key={`${reimbursement.from}-${reimbursement.to}`}
                  fromId={reimbursement.from}
                  toId={reimbursement.to}
                  fromName={participantName(reimbursement.from)}
                  toName={participantName(reimbursement.to)}
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
        </CardContent>
      </Card>
    </div>
  )
}
