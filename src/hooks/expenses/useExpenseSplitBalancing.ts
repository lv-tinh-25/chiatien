'use client'

import type { Currency } from '@/lib/currency'
import { redistributeShares } from '@/lib/expense-split'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

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
    if (
      previous.current.splitMode !== splitMode ||
      previous.current.amount !== amount
    ) {
      previous.current = { splitMode, amount }
      setManuallyEdited(new Set())
    }
  }, [splitMode, amount])

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
