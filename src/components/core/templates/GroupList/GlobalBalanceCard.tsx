'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
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
  const totals = new Map<
    string,
    { owed: number; owing: number; currency: Balance }
  >()

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

  /** How many groups contribute to one side of one currency's total. */
  const groupsWith = (key: string, predicate: (amount: number) => boolean) =>
    new Set(
      balances
        .filter((b) => (b.currencyCode ?? b.currency) === key)
        .filter(({ amount }) => predicate(amount))
        .map((b) => b.groupId),
    ).size

  return (
    <Card tier="float" className="rounded-hero p-5">
      {/* The heading has to stay a real heading inside a header element: the
          ported `cardByTitle` helper finds a card by walking up two levels from
          its heading. */}
      <CardHeader className="p-0">
        <CardTitle className="text-label-md tracking-wide text-muted-foreground uppercase">
          <span className="md:hidden">{t('title')}</span>
          <span className="hidden md:inline">{t('titleWide')}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-3.5 flex flex-col gap-3 p-0">
        {totals.map(([key, { owed, owing, currency }]) => {
          const money = getCurrencyFromGroup(currency)
          if (owed === 0 && owing === 0) {
            return (
              <p key={key} className="text-body-lg text-muted-foreground">
                {t('settledUp')}
              </p>
            )
          }
          return (
            <div key={key} className="flex gap-3">
              <div className="flex flex-1 flex-col rounded-control bg-credit-subtle/90 px-3.5 py-3 ring-1 ring-credit/20 ring-inset lg:px-4 lg:py-3.5">
                <span className="text-label-md font-semibold text-credit">
                  {t('owedToYou')}
                </span>
                <Money
                  amount={owed}
                  currency={money}
                  locale={locale}
                  tone="credit"
                  className="text-numeric-hero"
                />
                {groupsWith(key, (a) => a > 0) > 0 && (
                  <span className="text-body-sm font-semibold text-credit/75">
                    {t('groupCount', { count: groupsWith(key, (a) => a > 0) })}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col rounded-control bg-debit-subtle/90 px-3.5 py-3 ring-1 ring-debit/20 ring-inset lg:px-4 lg:py-3.5">
                <span className="text-label-md font-semibold text-debit">
                  {t('youOwe')}
                </span>
                <Money
                  amount={owing}
                  currency={money}
                  locale={locale}
                  tone="debit"
                  className="text-numeric-hero"
                />
                {groupsWith(key, (a) => a < 0) > 0 && (
                  <span className="text-body-sm font-semibold text-debit/75">
                    {t('groupCount', { count: groupsWith(key, (a) => a < 0) })}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
