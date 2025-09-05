'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/atoms/Card'
import { Money } from '@/components/core/atoms/Money'
import { asLocale } from '@/i18n/locales'
import { getCurrencyFromGroup } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'

type Balance = {
  groupId: string
  currency: string
  currencyCode: string | null
  amount: number
}

/**
 * Amounts are grouped by currency rather than summed outright: a balance in
 * dong and one in dollars have no meaningful total.
 */
function totalsByCurrency(balances: Balance[]) {
  const totals = new Map<string, { owed: number; owing: number; currency: Balance }>()

  for (const balance of balances) {
    const key = balance.currencyCode ?? balance.currency
    const entry = totals.get(key) ?? { owed: 0, owing: 0, currency: balance }
    if (balance.amount > 0) entry.owed += balance.amount
    else entry.owing += -balance.amount
    totals.set(key, entry)
  }

  return [...totals.entries()]
}

export function GlobalBalanceCard({ balances }: { balances: Balance[] }) {
  const t = useTranslations('Groups.GlobalBalance')
  const locale = asLocale(useLocale())
  const totals = totalsByCurrency(balances)

  if (totals.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {totals.map(([key, { owed, owing, currency }]) => {
          const money = getCurrencyFromGroup(currency)
          if (owed === 0 && owing === 0) {
            return (
              <p key={key} className="text-body-md text-muted-foreground">
                {t('settledUp')}
              </p>
            )
          }
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-label-md text-muted-foreground">
                  {t('owedToYou')}
                </span>
                <Money
                  amount={owed}
                  currency={money}
                  locale={locale}
                  tone="credit"
                  className="text-numeric-table-lg"
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-label-md text-muted-foreground">
                  {t('youOwe')}
                </span>
                <Money
                  amount={owing}
                  currency={money}
                  locale={locale}
                  tone="debit"
                  className="text-numeric-table-lg"
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
