import dayjs from 'dayjs'
import { useCallback, useSyncExternalStore } from 'react'
import useSWR, { Fetcher } from 'swr'
import * as z from 'zod'

const emptySubscribe = () => () => {}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  // The server snapshot is `false` rather than a guess: the first client render
  // has to match the server's markup, and the subscription corrects it.
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export function useBaseUrl(): string | null {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => null,
  )
}

// Parsed rather than asserted: the exchange-rate messages downstream turn on
// `date` and on which codes `rates` holds, so a response that does not match
// has to fail here rather than silently produce a wrong conversion.
const frankfurterResponse = z.object({
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number()),
})

type FrankfurterAPIResponse = z.infer<typeof frankfurterResponse>

const fetcher: Fetcher<FrankfurterAPIResponse> = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok)
      throw new TypeError('Unsuccessful response from API', { cause: res })
    return frankfurterResponse.parse(await res.json())
  })

export function useCurrencyRate(
  date: Date,
  baseCurrency: string,
  targetCurrency: string,
) {
  const dateString = dayjs(date).format('YYYY-MM-DD')

  const url =
    !isNaN(date.getTime()) &&
    !!baseCurrency.length &&
    !!targetCurrency.length &&
    baseCurrency !== targetCurrency &&
    `https://api.frankfurter.dev/v1/${dateString}?base=${baseCurrency}`
  const { data, error, isLoading, mutate } = useSWR<FrankfurterAPIResponse>(
    url,
    fetcher,
    { shouldRetryOnError: false, revalidateOnFocus: false },
  )

  if (data) {
    let exchangeRate = undefined
    let sentError = error
    if (!error && data.date !== dateString) {
      // this happens if for example, the requested date is in the future.
      sentError = new RangeError(data.date)
    }
    if (data.rates[targetCurrency]) {
      exchangeRate = data.rates[targetCurrency]
    }
    return {
      data: exchangeRate,
      error: sentError,
      isLoading,
      refresh: mutate,
    }
  }

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}
