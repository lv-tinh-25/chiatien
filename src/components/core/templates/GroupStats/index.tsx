'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { Money } from '@/components/core/atoms/Money'
import { CategoryEmoji } from '@/components/core/atoms/CategoryEmoji'
import { CategoryDrilldown } from '@/components/core/templates/GroupStats/CategoryDrilldown'
import { MonthDrilldown } from '@/components/core/templates/GroupStats/MonthDrilldown'
import { ParticipantTable } from '@/components/core/templates/GroupStats/ParticipantTable'
import { StatBar } from '@/components/core/templates/GroupStats/StatBar'
import { StatsRangeSelector } from '@/components/core/templates/GroupStats/StatsRangeSelector'
import { TotalsCard } from '@/components/core/templates/GroupStats/TotalsCard'
import { useGroupStats } from '@/hooks/stats/useGroupStats'
import { formatMonth } from '@/lib/format-month'
import { formatCurrency, formatDateOnly } from '@/lib/utils'
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
  const categoryMax = widest(stats.categories.map((row) => row.total))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="hidden shrink-0 text-headline-lg font-extrabold text-foreground lg:block">
          {t('title')}
        </h1>
        <StatsRangeSelector
          period={period}
          customRange={customRange}
          onPeriodChange={setPeriod}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {/* A bento of independent readings of the same range: the two that carry
          a chart take a full row so no bar is squeezed into a third. */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <TotalsCard
          className={
            stats.recurring.count > 0 ? 'lg:col-span-2' : 'lg:col-span-3'
          }
          totalGroupSpendings={stats.totalGroupSpendings}
          totalParticipantSpendings={
            activeUserId === null ? undefined : stats.totalParticipantSpendings
          }
          totalParticipantShare={
            activeUserId === null ? undefined : stats.totalParticipantShare
          }
          currency={currency}
          locale={locale}
        />

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
                <div className="text-body-sm text-muted-foreground">
                  {t('Recurring.estimatedYearly', {
                    amount: formatCurrency(
                      currency,
                      stats.recurring.estimatedYearly,
                      locale,
                    ),
                  })}
                </div>
              </div>
              <ul className="flex flex-col gap-1">
                {stats.recurring.byPeriod
                  .filter((entry) => entry.count > 0)
                  .map((entry) => (
                    <li
                      key={entry.period}
                      className="flex items-baseline justify-between gap-2 text-body-md text-muted-foreground"
                    >
                      <span>
                        {t(`Recurring.period.${entry.period}`, {
                          count: entry.count,
                        })}
                      </span>
                      {money(entry.total)}
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-3">
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

        <Card className="lg:col-span-2">
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
              <ParticipantTable
                participants={stats.participants}
                currency={currency}
                locale={locale}
              />
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
                          icon={<CategoryEmoji categoryId={row.categoryId} size="sm" />}
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

        <Card className="lg:col-span-3">
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
                      {formatDateOnly(
                        new Date(stats.summary.firstDate),
                        locale,
                        {
                          dateStyle: 'medium',
                        },
                      )}{' '}
                      –{' '}
                      {formatDateOnly(
                        new Date(stats.summary.lastDate),
                        locale,
                        {
                          dateStyle: 'medium',
                        },
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
