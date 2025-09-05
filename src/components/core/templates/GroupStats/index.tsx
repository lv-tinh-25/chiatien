'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { Money } from '@/components/core/atoms/Money'
import { CategoryDrilldown } from '@/components/core/templates/GroupStats/CategoryDrilldown'
import { MonthDrilldown } from '@/components/core/templates/GroupStats/MonthDrilldown'
import { StatBar } from '@/components/core/templates/GroupStats/StatBar'
import { StatsRangeSelector } from '@/components/core/templates/GroupStats/StatsRangeSelector'
import { useGroupStats } from '@/hooks/stats/useGroupStats'
import { formatMonth } from '@/lib/format-month'
import { formatDateOnly } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function GroupStats() {
  const t = useTranslations('Stats')
  const tCategories = useTranslations('Categories')
  const {
    groupId,
    range,
    locale,
    currency,
    activeUserId,
    period,
    setPeriod,
    customRange,
    setCustomRange,
    stats,
    isPending,
  } = useGroupStats()

  if (isPending || !stats || !currency) return null

  const money = (amount: number) => (
    <Money amount={amount} currency={currency} locale={locale} />
  )

  const widest = (values: number[]) => Math.max(0, ...values.map(Math.abs))
  const monthMax = widest(stats.months.map((month) => month.total))
  const participantMax = widest(stats.participants.map((row) => row.paid))
  const categoryMax = widest(stats.categories.map((row) => row.total))

  return (
    <div className="flex flex-col gap-4 py-4">
      <StatsRangeSelector
        period={period}
        customRange={customRange}
        onPeriodChange={setPeriod}
        onCustomRangeChange={setCustomRange}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('Totals.title')}</CardTitle>
          <CardDescription>{t('Totals.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col">
            <span className="text-label-md text-muted-foreground">
              {t('Totals.groupSpendings')}
            </span>
            <span className="text-numeric-table-lg">
              {money(stats.totalGroupSpendings)}
            </span>
          </div>
          {activeUserId !== null &&
            stats.totalParticipantSpendings !== undefined && (
              <div className="flex flex-col">
                <span className="text-label-md text-muted-foreground">
                  {t('Totals.yourSpendings')}
                </span>
                <span className="text-numeric-table-lg">
                  {money(stats.totalParticipantSpendings)}
                </span>
              </div>
            )}
          {activeUserId !== null && stats.totalParticipantShare !== undefined && (
            <div className="flex flex-col">
              <span className="text-label-md text-muted-foreground">
                {t('Totals.yourShare')}
              </span>
              <span className="text-numeric-table-lg">
                {money(stats.totalParticipantShare)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Summary.title')}</CardTitle>
          <CardDescription>{t('Summary.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.summary.expenseCount === 0 ? (
            <p className="text-body-md text-muted-foreground">
              {t('Summary.empty')}
            </p>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-label-md text-muted-foreground">
                  {t('Summary.expenseCount')}
                </dt>
                <dd className="text-numeric-table-md tabular">
                  {stats.summary.expenseCount}
                </dd>
              </div>
              <div>
                <dt className="text-label-md text-muted-foreground">
                  {t('Summary.averageExpense')}
                </dt>
                <dd>{money(stats.summary.averageExpense)}</dd>
              </div>
              {stats.summary.largestExpense && (
                <div>
                  <dt className="text-label-md text-muted-foreground">
                    {t('Summary.largestExpense')}
                  </dt>
                  <dd>
                    {stats.summary.largestExpense.title} ·{' '}
                    {money(stats.summary.largestExpense.amount)}
                  </dd>
                </div>
              )}
              {stats.summary.firstDate && stats.summary.lastDate && (
                <div>
                  <dt className="text-label-md text-muted-foreground">
                    {t('Summary.activeSpan')}
                  </dt>
                  <dd className="tabular">
                    {formatDateOnly(new Date(stats.summary.firstDate), locale, {
                      dateStyle: 'medium',
                    })}{' '}
                    –{' '}
                    {formatDateOnly(new Date(stats.summary.lastDate), locale, {
                      dateStyle: 'medium',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('OverTime.title')}</CardTitle>
          <CardDescription>{t('OverTime.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.months.length === 0 ? (
            <p className="text-body-md text-muted-foreground">
              {t('OverTime.empty')}
            </p>
          ) : (
            <ul>
              {stats.months.map((month) => (
                <MonthDrilldown
                  key={month.month}
                  groupId={groupId}
                  month={month.month}
                  monthLabel={formatMonth(month.month, locale)}
                  range={range}
                  currency={currency}
                  locale={locale}
                  trigger={
                    <StatBar
                      label={formatMonth(month.month, locale)}
                      value={money(month.total)}
                      fill={monthMax === 0 ? 0 : month.total / monthMax}
                      selectLabel={t('OverTime.showExpenses', {
                        month: formatMonth(month.month, locale),
                      })}
                      asButton
                    />
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('ByParticipant.title')}</CardTitle>
          <CardDescription>{t('ByParticipant.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.participants.length === 0 ? (
            <p className="text-body-md text-muted-foreground">
              {t('ByParticipant.empty')}
            </p>
          ) : (
            <ul>
              {stats.participants.map((row) => (
                <StatBar
                  key={row.participantId}
                  label={row.name}
                  value={money(row.paid)}
                  fill={participantMax === 0 ? 0 : row.paid / participantMax}
                  tone="secondary"
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('ByCategory.title')}</CardTitle>
          <CardDescription>{t('ByCategory.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.categories.length === 0 ? (
            <p className="text-body-md text-muted-foreground">
              {t('ByCategory.empty')}
            </p>
          ) : (
            <ul>
              {stats.categories.map((row) => {
                const label = tCategories(`${row.grouping}.${row.name}`)
                return (
                  <CategoryDrilldown
                    key={row.categoryId}
                    groupId={groupId}
                    categoryId={row.categoryId}
                    categoryLabel={label}
                    range={range}
                    currency={currency}
                    locale={locale}
                    trigger={
                      <StatBar
                        label={label}
                        value={money(row.total)}
                        fill={categoryMax === 0 ? 0 : row.total / categoryMax}
                        selectLabel={t('ByCategory.showExpenses', {
                          category: label,
                        })}
                        asButton
                      />
                    }
                  />
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {stats.recurring.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('Recurring.title')}</CardTitle>
            <CardDescription>{t('Recurring.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <span className="text-label-md text-muted-foreground">
                {t('Recurring.estimatedMonthly')}
              </span>
              <div className="text-numeric-table-lg">
                {money(stats.recurring.estimatedMonthly)}
              </div>
            </div>
            <ul className="flex flex-col gap-1">
              {stats.recurring.byPeriod
                .filter((entry) => entry.count > 0)
                .map((entry) => (
                  <li key={entry.period} className="text-body-md text-muted-foreground">
                    {t(`Recurring.period.${entry.period}`, { count: entry.count })}
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
