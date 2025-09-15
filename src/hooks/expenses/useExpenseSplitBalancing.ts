'use client'

import type { Currency } from '@/lib/currency'
import { redistributeShares, seedSharesForMode } from '@/lib/expense-split'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

/**
 * Keeps `BY_AMOUNT` shares adding up to the expense total.
 *
 * A participant is only auto-filled until the user types into their field;
 * after that their value is theirs and the remainder is spread over whoever is
 * left. Changing the amount or the split mode clears that memory, because the
 * previously typed numbers no longer relate to the new total.
 */
export function useExpenseSplitBalancing(
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>,
  currency: Currency,
) {
  const [manuallyEdited, setManuallyEdited] = useState<Set<string>>(new Set())
  const splitMode = useWatch({ control: form.control, name: 'splitMode' })
  const amount = useWatch({ control: form.control, name: 'amount' })
  const previous = useRef({ splitMode, amount })

  const markEdited = useCallback((participant: string) => {
    setManuallyEdited((edited) =>
      edited.has(participant) ? edited : new Set(edited).add(participant),
    )
  }, [])

  useEffect(() => {
    const modeChanged = previous.current.splitMode !== splitMode
    if (!modeChanged && previous.current.amount === amount) return
    previous.current = { splitMode, amount }
    setManuallyEdited(new Set())

    // Only a mode the user switched to is re-seeded. The first run matches the
    // mode the form opened on, so an expense being edited keeps its stored
    // shares.
    if (!modeChanged || splitMode === undefined) return
    const paidFor = form.getValues('paidFor')
    const seeded = seedSharesForMode(splitMode, paidFor)
    if (seeded !== paidFor) {
      form.setValue('paidFor', seeded, { shouldValidate: true })
    }
  }, [splitMode, amount, form])

  useEffect(() => {
    if (splitMode !== 'BY_AMOUNT') return
    const paidFor = form.getValues('paidFor')
    const next = redistributeShares(
      'BY_AMOUNT',
      paidFor,
      Number(amount) || 0,
      manuallyEdited,
      currency,
    )
    if (next !== paidFor) {
      form.setValue('paidFor', next, { shouldValidate: true })
    }
    // `form` is stable and `paidFor` is read imperatively, so re-running on the
    // values that actually drive the split is deliberate.
  }, [splitMode, amount, manuallyEdited, currency, form])

  return { markEdited }
}
