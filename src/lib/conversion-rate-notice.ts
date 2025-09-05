const NBSP = ' '

export type ConversionRateMessage = {
  /** A key under `ExpenseForm.conversionRateState`. */
  key: string
  values?: { date: string }
}

export type ConversionRateNotice = {
  /** Rendered in order, separated by a space. */
  messages: ConversionRateMessage[]
  /** The rate itself, appended after the messages, or null when there is none. */
  display: string | null
}

type ConversionRateInput = {
  isLoading: boolean
  hasDate: boolean
  usingCustomRate: boolean
  rate: number | undefined
  error: unknown
  originalCode: string
  groupCode: string
}

/**
 * Explains what happened to the exchange-rate lookup.
 *
 * A rate can be missing, stale, or for a different day than the expense, and
 * each case changes what the amount actually means — so none of them may pass
 * silently. `useCurrencyRate` signals "the API answered for another date" by
 * returning a RangeError whose message is the date it answered for.
 */
export function conversionRateNotice({
  isLoading,
  hasDate,
  usingCustomRate,
  rate,
  error,
  originalCode,
  groupCode,
}: ConversionRateInput): ConversionRateNotice {
  const display =
    rate === undefined
      ? null
      : `${originalCode}${NBSP}1${NBSP}=${NBSP}${groupCode}${NBSP}${rate}`

  if (!hasDate) return { messages: [{ key: 'noDate' }], display: null }
  if (usingCustomRate)
    return { messages: [{ key: 'customRate' }], display: null }
  if (isLoading) return { messages: [{ key: 'loading' }], display: null }

  if (error !== undefined && error !== null) {
    const cause: ConversionRateMessage =
      error instanceof RangeError && rate !== undefined
        ? { key: 'dateMismatch', values: { date: error.message } }
        : { key: 'error' }
    return {
      messages: [cause, { key: display === null ? 'noRate' : 'staleRate' }],
      display,
    }
  }

  return display === null
    ? { messages: [{ key: 'currencyNotFound' }], display: null }
    : { messages: [{ key: 'success' }], display }
}
