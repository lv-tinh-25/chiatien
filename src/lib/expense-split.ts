import type { SplitMode } from '@/generated/prisma/browser'
import type { Currency } from '@/lib/currency'
import { distributeAmount } from '@/lib/shares'
import { amountAsMinorUnits, formatAmountAsDecimal } from '@/lib/utils'

type PaidForRow = { participant: string; shares: string | number }

/**
 * Fills in the shares of participants the user has not typed a value for, so
 * the amounts still add up to the total.
 *
 * Only `BY_AMOUNT` needs this: the other modes carry ratios, which stay valid
 * whatever the total is. The split goes through `distributeAmount` in minor
 * units rather than dividing and rounding each share, because rounding
 * independently does not preserve a sum — 95 across three participants comes
 * out as 31.67 three times, which the schema then rejects.
 */
export function redistributeShares<T extends PaidForRow>(
  splitMode: SplitMode,
  paidFor: T[],
  totalAmount: number,
  manuallyEdited: Set<string>,
  currency: Currency,
): T[] {
  if (splitMode !== 'BY_AMOUNT') return paidFor

  const untouched = paidFor.filter(
    (row) => !manuallyEdited.has(row.participant),
  )
  if (untouched.length === 0) return paidFor

  const claimed = paidFor
    .filter((row) => manuallyEdited.has(row.participant))
    .reduce((sum, row) => sum + (Number(row.shares) || 0), 0)

  const remaining = amountAsMinorUnits(totalAmount - claimed, currency)
  const amounts = distributeAmount(remaining, untouched.length)

  let next = 0
  return paidFor.map((row) =>
    manuallyEdited.has(row.participant)
      ? row
      : { ...row, shares: formatAmountAsDecimal(amounts[next++], currency) },
  )
}
