'use client'

import type { SplitMode } from '@/generated/prisma/browser'
import type { Currency } from '@/lib/currency'
import {
  redistributeShares,
  rememberShares,
  restoreShares,
  type SharesByParticipant,
} from '@/lib/expense-split'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

/**
 * Owns what each split tab holds.
 *
 * Every tab reads `shares` on its own scale, so switching cannot simply carry
 * the numbers over. Each tab keeps its own values instead: leaving one records
 * what is in it, arriving at one puts back what was there, and a tab opened for
 * the first time is seeded.
 *
 * `BY_AMOUNT` additionally keeps adding up to the expense total. A participant
 * is auto-filled only until the user types into their field; after that their
 * value is theirs and the remainder is spread over whoever is left. A new
 * amount clears that memory, because the previously typed numbers no longer
 * relate to the new total.
 */
export function useExpenseSplitBalancing(
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>,
  currency: Currency,
) {
  const [manuallyEdited, setManuallyEdited] = useState<Set<string>>(new Set())
  const splitMode = useWatch({ control: form.control, name: 'splitMode' })
  const amount = useWatch({ control: form.control, name: 'amount' })
  const previous = useRef({ splitMode, amount })
  const remembered = useRef<Partial<Record<SplitMode, SharesByParticipant>>>({})

  const markEdited = useCallback((participant: string) => {
    setManuallyEdited((edited) =>
      edited.has(participant) ? edited : new Set(edited).add(participant),
    )
  }, [])

  useEffect(() => {
    const previousMode = previous.current.splitMode
    const modeChanged = previousMode !== splitMode
    if (!modeChanged && previous.current.amount === amount) return
    previous.current = { splitMode, amount }

    if (!modeChanged || splitMode === undefined) {
      setManuallyEdited(new Set())
      return
    }

    const paidFor = form.getValues('paidFor')
    if (previousMode !== undefined) {
      remembered.current[previousMode] = rememberShares(paidFor)
    }

    const { rows, restored } = restoreShares(
      splitMode,
      paidFor,
      remembered.current[splitMode],
    )
    // Restored values are the user's own, so `redistributeShares` must treat
    // them as typed rather than spread the total over them again.
    setManuallyEdited(
      restored ? new Set(rows.map((row) => row.participant)) : new Set(),
    )
    if (rows !== paidFor) {
      form.setValue('paidFor', rows, { shouldValidate: true })
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
