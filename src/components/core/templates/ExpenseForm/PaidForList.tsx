'use client'

import { Button } from '@/components/core/atoms/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import { PaidForRow } from '@/components/core/templates/ExpenseForm/PaidForRow'
import type { SplitMode } from '@/generated/prisma/browser'
import type { Currency } from '@/lib/currency'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

type PaidForRows = ExpenseFormInput['paidFor']

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  participants: { id: string; name: string }[]
  currency: Currency
  isIncome: boolean
  onShareEdited: (participantId: string) => void
}

export function PaidForList({
  form,
  participants,
  currency,
  isIncome,
  onShareEdited,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const tErrors = useTranslations('SchemaErrors')
  const scope = isIncome ? 'Income' : 'Expense'
  const paidFor: PaidForRows = useWatch({ control: form.control, name: 'paidFor' }) ?? []
  const splitMode: SplitMode = useWatch({ control: form.control, name: 'splitMode' }) ?? 'EVENLY'
  const errorKey = form.formState.errors.paidFor?.message

  const rowFor = (participantId: string) =>
    paidFor.find((row) => row.participant === participantId)

  const setAll = (checked: boolean) =>
    form.setValue(
      'paidFor',
      checked
        ? participants.map(
            (participant) =>
              rowFor(participant.id) ?? { participant: participant.id, shares: '1' },
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
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <CardTitle>{t(`${scope}.paidFor.title`)}</CardTitle>
          <CardDescription>{t(`${scope}.paidFor.description`)}</CardDescription>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setAll(true)}>
            {t('selectAll')}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setAll(false)}>
            {t('selectNone')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {participants.map((participant) => {
            const row = rowFor(participant.id)
            return (
              <PaidForRow
                key={participant.id}
                participant={participant}
                checked={row !== undefined}
                splitMode={splitMode}
                currency={currency}
                shares={String(row?.shares ?? '')}
                onToggle={(checked) => toggle(participant.id, checked)}
                onSharesChange={(shares) => setShares(participant.id, shares)}
              />
            )
          })}
        </ul>
        {errorKey && (
          <p role="alert" className="mt-2 text-body-sm text-destructive">
            {tErrors(errorKey)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
