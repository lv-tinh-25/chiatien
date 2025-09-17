'use client'

import { DateInput } from '@/components/core/atoms/DateInput'
import { SegmentedControl } from '@/components/core/molecules/SegmentedControl'
import {
  STATS_PERIODS,
  type StatsPeriod,
  type StatsRange,
} from '@/lib/stats-range'
import { useTranslations } from 'next-intl'

type Props = {
  period: StatsPeriod
  customRange: StatsRange
  onPeriodChange: (period: StatsPeriod) => void
  onCustomRangeChange: (range: StatsRange) => void
}

/** Design order: nearest range first, everything last, custom at the end. */
const ORDER: StatsPeriod[] = [
  'thisMonth',
  'last3Months',
  'thisYear',
  'all',
  'custom',
]

export function StatsRangeSelector({
  period,
  customRange,
  onPeriodChange,
  onCustomRangeChange,
}: Props) {
  const t = useTranslations('Stats.range')

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        ariaLabel={t('label')}
        value={period}
        onValueChange={(value) => {
          const next = STATS_PERIODS.find((candidate) => candidate === value)
          if (next) onPeriodChange(next)
        }}
        options={ORDER.map((candidate) => ({
          value: candidate,
          label: t(candidate),
          shortLabel: t(`${candidate}Short`),
        }))}
        className="w-full justify-between overflow-x-auto md:w-auto"
      />

      {period === 'custom' && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* The input sits inside its label rather than beside it: an implicit
              association keeps the pair addressable as one node. */}
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-label-md text-muted-foreground">
              {t('from')}
            </span>
            <DateInput
              value={customRange.from ?? ''}
              onChange={(event) =>
                onCustomRangeChange({
                  ...customRange,
                  from: event.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-label-md text-muted-foreground">
              {t('to')}
            </span>
            <DateInput
              value={customRange.to ?? ''}
              onChange={(event) =>
                onCustomRangeChange({ ...customRange, to: event.target.value })
              }
            />
          </label>
        </div>
      )}
    </div>
  )
}
