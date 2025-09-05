'use client'

import { FormField } from '@/components/core/molecules/FormField'
import { Select } from '@/components/core/molecules/Select'
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

const DATE_INPUT =
  'flex min-h-touch-min w-full rounded-control border border-input bg-card px-3 text-body-lg text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20'

export function StatsRangeSelector({
  period,
  customRange,
  onPeriodChange,
  onCustomRangeChange,
}: Props) {
  const t = useTranslations('Stats.range')

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <FormField label={t('label')} className="sm:w-56">
        {({ id }) => (
          <Select
            id={id}
            value={period}
            onValueChange={(value) => {
              const next = STATS_PERIODS.find(
                (candidate) => candidate === value,
              )
              if (next) onPeriodChange(next)
            }}
            options={STATS_PERIODS.map((candidate) => ({
              value: candidate,
              label: t(candidate),
            }))}
          />
        )}
      </FormField>

      {period === 'custom' && (
        <>
          {/* The input sits inside its label rather than beside it: an implicit
              association keeps the pair addressable as one node. */}
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-label-md text-foreground">{t('from')}</span>
            <input
              type="date"
              className={DATE_INPUT}
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
            <span className="text-label-md text-foreground">{t('to')}</span>
            <input
              type="date"
              className={DATE_INPUT}
              value={customRange.to ?? ''}
              onChange={(event) =>
                onCustomRangeChange({ ...customRange, to: event.target.value })
              }
            />
          </label>
        </>
      )}
    </div>
  )
}
