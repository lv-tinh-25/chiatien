'use client'

import { Checkbox } from '@/components/core/atoms/Checkbox'
import { ShareInput } from '@/components/core/templates/ExpenseForm/ShareInput'
import type { SplitMode } from '@/generated/prisma/browser'
import type { Currency } from '@/lib/currency'

type PaidForRowProps = {
  participant: { id: string; name: string }
  checked: boolean
  splitMode: SplitMode
  currency: Currency
  shares: string
  onToggle: (checked: boolean) => void
  onSharesChange: (value: string) => void
}

/**
 * `data-id` and a checkbox whose accessible name starts with the participant's
 * name are the contract the ported Playwright helpers use to find a row: the
 * share inputs inside carry no name attribute of their own.
 */
export function PaidForRow({
  participant,
  checked,
  splitMode,
  currency,
  shares,
  onToggle,
  onSharesChange,
}: PaidForRowProps) {
  return (
    <li
      data-id={participant.id}
      className="flex items-center justify-between gap-3 rounded-control px-1 py-1.5"
    >
      <label className="flex min-h-touch-min flex-1 items-center gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(state) => onToggle(state === true)}
          aria-label={participant.name}
        />
        <span className="text-body-lg text-foreground">{participant.name}</span>
      </label>

      {checked && splitMode !== 'EVENLY' && (
        <ShareInput
          splitMode={splitMode}
          currency={currency}
          value={shares}
          participantName={participant.name}
          onChange={onSharesChange}
        />
      )}
    </li>
  )
}
