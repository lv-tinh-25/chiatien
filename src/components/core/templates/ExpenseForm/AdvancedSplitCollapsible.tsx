'use client'

import { Button } from '@/components/core/atoms/Button'
import { Checkbox } from '@/components/core/atoms/Checkbox'
import { FormField } from '@/components/core/molecules/FormField'
import { Select } from '@/components/core/molecules/Select'
import type { SplitMode } from '@/generated/prisma/browser'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

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

export function AdvancedSplitCollapsible({
  form,
  isIncome,
}: {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  isIncome: boolean
}) {
  const t = useTranslations('ExpenseForm')
  const [open, setOpen] = useState(false)
  const splitMode = useWatch({ control: form.control, name: 'splitMode' })
  const saveAsDefault = useWatch({
    control: form.control,
    name: 'saveDefaultSplittingOptions',
  })
  const scope = isIncome ? 'Income' : 'Expense'

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <Button type="button" variant="ghost" className="px-0">
          <ChevronDown
            aria-hidden
            className={
              open ? 'rotate-180 transition-transform' : 'transition-transform'
            }
          />
          {t('advancedOptions')}
        </Button>
      </Collapsible.Trigger>

      <Collapsible.Content className="flex flex-col gap-4 pt-3">
        <FormField
          label={t('SplitModeField.label')}
          description={t(`${scope}.splitModeDescription`)}
        >
          {({ id, describedBy }) => (
            <Select
              id={id}
              testId="split-mode"
              aria-describedby={describedBy}
              value={String(splitMode ?? 'EVENLY')}
              onValueChange={(value) =>
                form.setValue(
                  'splitMode',
                  SPLIT_MODES.find((mode) => mode === value),
                  { shouldValidate: true },
                )
              }
              options={SPLIT_MODES.map((mode) => ({
                value: mode,
                label: t(`SplitModeField.${LABEL_KEYS[mode]}`),
              }))}
            />
          )}
        </FormField>

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
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
