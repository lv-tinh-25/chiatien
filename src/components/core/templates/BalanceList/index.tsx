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
import { amountAsDecimal } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export function BalanceList() {
  const t = useTranslations('Balances')
  const router = useRouter()
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
  const settle = (from: string, to: string, amount: number) => {
    const query = new URLSearchParams({
      reimbursement: 'true',
      from,
      to,
      amount: String(amountAsDecimal(amount, currency)),
    })
    router.push(`/groups/${groupId}/expenses/create?${query.toString()}`)
  }

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
                  from={participantName(reimbursement.from)}
                  to={participantName(reimbursement.to)}
                  amount={reimbursement.amount}
                  currency={currency}
                  locale={locale}
                  onSettle={() =>
                    settle(
                      reimbursement.from,
                      reimbursement.to,
                      reimbursement.amount,
                    )
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
