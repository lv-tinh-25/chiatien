'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
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
 *
 * That contract also reads the participant's name off the row's first line of
 * `innerText`, which is why the name comes first in the DOM and the avatar and
 * checkbox are moved ahead of it with `order`. `innerText` follows the DOM, not
 * the visual order, so the initials cannot be mistaken for the name.
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
      className="flex items-center justify-between gap-3 border-b border-border/50 py-2 last:border-b-0"
    >
      <label className="flex min-h-touch-min flex-1 items-center gap-3">
        <span className="min-w-0 flex-1 truncate text-body-lg font-semibold text-foreground">
          {participant.name}
        </span>
        <Checkbox
          checked={checked}
          onCheckedChange={(state) => onToggle(state === true)}
          aria-label={participant.name}
          className="order-first shrink-0"
        />
        <Avatar
          name={participant.name}
          size="lg"
          className="order-first size-7.5"
        />
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
