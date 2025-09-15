'use client'

import { Card } from '@/components/core/atoms/Card'
import { Checkbox } from '@/components/core/atoms/Checkbox'
import { SegmentedControl } from '@/components/core/molecules/SegmentedControl'
import { PaidForRow } from '@/components/core/templates/ExpenseForm/PaidForRow'
import type { SplitMode } from '@/generated/prisma/browser'
import { useFormErrors } from '@/hooks/forms/useFormErrors'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { distributeAmount } from '@/lib/shares'
import { amountAsMinorUnits, formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

type PaidForRows = ExpenseFormInput['paidFor']

const SPLIT_MODES: SplitMode[] = [
  'EVENLY',
  'BY_SHARES',
  'BY_PERCENTAGE',
  'BY_AMOUNT',
]

const LABEL_KEYS: Record<SplitMode, string> = {
  EVENLY: 'evenly',
  BY_SHARES: 'byShares',
  BY_PERCENTAGE: 'byPercentage',
  BY_AMOUNT: 'byAmount',
}

/** Short forms for the segmented track; `LABEL_KEYS` stays the accessible name. */
const CHIP_KEYS: Record<SplitMode, string> = {
  EVENLY: 'evenlyChip',
  BY_SHARES: 'bySharesChip',
  BY_PERCENTAGE: 'byPercentageChip',
  BY_AMOUNT: 'byAmountChip',
}

/** The design spells the rule out under the rows rather than in a tooltip. */
const HINT_KEYS: Record<SplitMode, string> = {
  EVENLY: 'evenly',
  BY_SHARES: 'byShares',
  BY_PERCENTAGE: 'byPercentage',
  BY_AMOUNT: 'byAmount',
}

const SHORT_KEYS: Record<SplitMode, string> = {
  EVENLY: 'evenlyShort',
  BY_SHARES: 'bySharesShort',
  BY_PERCENTAGE: 'byPercentageShort',
  BY_AMOUNT: 'byAmountShort',
}

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  participants: { id: string; name: string }[]
  currency: Currency
  locale: Locale
  isIncome: boolean
  onShareEdited: (participantId: string) => void
}

export function PaidForList({
  form,
  participants,
  currency,
  locale,
  isIncome,
  onShareEdited,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const tErrors = useTranslations('SchemaErrors')
  const scope = isIncome ? 'Income' : 'Expense'
  const paidFor: PaidForRows =
    useWatch({ control: form.control, name: 'paidFor' }) ?? []
  const splitMode: SplitMode =
    useWatch({ control: form.control, name: 'splitMode' }) ?? 'EVENLY'
  const saveAsDefault = useWatch({
    control: form.control,
    name: 'saveDefaultSplittingOptions',
  })
  const amount = useWatch({ control: form.control, name: 'amount' })
  const errorKey = useFormErrors(form.control).paidFor?.message

  const rowFor = (participantId: string) =>
    paidFor.find((row) => row.participant === participantId)

  const allChecked =
    participants.length > 0 && paidFor.length === participants.length

  const total = amountAsMinorUnits(Number(amount) || 0, currency)
  const evenShares = distributeAmount(Math.abs(total), paidFor.length || 1)
  const shareDisplay = (participantId: string) => {
    const index = paidFor.findIndex((row) => row.participant === participantId)
    if (index < 0) return ''
    return formatCurrency(currency, evenShares[index] ?? 0, locale)
  }

  const setAll = (checked: boolean) =>
    form.setValue(
      'paidFor',
      checked
        ? participants.map(
            (participant) =>
              rowFor(participant.id) ?? {
                participant: participant.id,
                shares: '1',
              },
          )
        : [],
      { shouldValidate: true },
    )

  const toggle = (participantId: string, checked: boolean) =>
    form.setValue(
      'paidFor',
      checked
        ? [...paidFor, { participant: participantId, shares: '1' }]
        : paidFor.filter((row) => row.participant !== participantId),
      { shouldValidate: true },
    )

  const setShares = (participantId: string, shares: string) => {
    onShareEdited(participantId)
    form.setValue(
      'paidFor',
      paidFor.map((row) =>
        row.participant === participantId ? { ...row, shares } : row,
      ),
      { shouldValidate: true },
    )
  }

  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-body-lg font-extrabold text-foreground">
          {t(`${scope}.paidFor.title`)}
        </h2>
        <SegmentedControl
          testId="split-mode"
          ariaLabel={t('SplitModeField.label')}
          value={splitMode}
          onValueChange={(value) =>
            form.setValue(
              'splitMode',
              SPLIT_MODES.find((mode) => mode === value),
              { shouldValidate: true },
            )
          }
          options={SPLIT_MODES.map((mode) => ({
            value: mode,
            label: t(`SplitModeField.${CHIP_KEYS[mode]}`),
            shortLabel: t(`SplitModeField.${SHORT_KEYS[mode]}`),
            ariaLabel: t(`SplitModeField.${LABEL_KEYS[mode]}`),
          }))}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-body-sm font-bold text-muted-foreground">
          {t('selectedCount', {
            selected: paidFor.length,
            total: participants.length,
          })}
        </span>
        <button
          type="button"
          onClick={() => setAll(!allChecked)}
          className="cursor-pointer text-body-sm font-extrabold text-primary-ink hover:underline"
        >
          {allChecked ? t('selectNone') : t('selectAll')}
        </button>
      </div>

      {/* Capped rather than unbounded: past a dozen participants the submit
          button would otherwise sit a screen and a half below the amount. */}
      <ul className="flex max-h-66 flex-col overflow-y-auto">
        {participants.map((participant) => {
          const row = rowFor(participant.id)
          const peers = participants.map(({ name }) => name)
          return (
            <PaidForRow
              key={participant.id}
              participant={participant}
              peers={peers}
              checked={row !== undefined}
              splitMode={splitMode}
              currency={currency}
              shares={String(row?.shares ?? '')}
              shareDisplay={shareDisplay(participant.id)}
              onToggle={(checked) => toggle(participant.id, checked)}
              onSharesChange={(shares) => setShares(participant.id, shares)}
            />
          )
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 text-body-sm font-semibold text-muted-foreground">
        <span>
          {t(`splitHint.${HINT_KEYS[splitMode]}`, { count: paidFor.length })}
        </span>
        <span className="text-numeric-table-md text-credit tabular">
          {formatCurrency(currency, Math.abs(total), locale)}
        </span>
      </div>

      <label className="flex min-h-touch-min items-center gap-3">
        <Checkbox
          checked={Boolean(saveAsDefault)}
          onCheckedChange={(state) =>
            form.setValue('saveDefaultSplittingOptions', state === true)
          }
        />
        <span className="text-body-md text-foreground">
          {t('SplitModeField.saveAsDefault')}
        </span>
      </label>

      {errorKey && (
        <p role="alert" className="text-body-sm text-destructive">
          {tErrors(errorKey)}
        </p>
      )}
    </Card>
  )
}
