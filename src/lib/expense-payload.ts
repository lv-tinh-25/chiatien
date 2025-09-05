import type { Currency } from '@/lib/currency'
import type { ExpenseFormValues } from '@/lib/schemas'
import { amountAsMinorUnits } from '@/lib/utils'

/**
 * Converts form values from display decimals into the minor units the database
 * stores.
 *
 * The three conversion fields are dropped together when no conversion applies:
 * a repayment whose converted amount rounds to zero would otherwise be saved
 * with a rate but no amount to apply it to.
 */
export function toExpensePayload(
  values: ExpenseFormValues,
  groupCurrency: Currency,
  originalCurrency: Currency,
  conversionRequired: boolean,
): ExpenseFormValues {
  const payload: ExpenseFormValues = {
    ...values,
    amount: amountAsMinorUnits(values.amount, groupCurrency),
    paidFor: values.paidFor.map(({ participant, shares }) => ({
      participant,
      shares:
        values.splitMode === 'BY_AMOUNT'
          ? amountAsMinorUnits(shares, groupCurrency)
          : shares,
    })),
  }

  if (conversionRequired && values.originalAmount !== undefined) {
    payload.originalAmount = amountAsMinorUnits(
      values.originalAmount,
      originalCurrency,
    )
  } else {
    delete payload.originalAmount
    delete payload.originalCurrency
    delete payload.conversionRate
  }

  return payload
}
