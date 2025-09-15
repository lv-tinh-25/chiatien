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
// has to fail here rather than silently produce a wrong conversion. The API
// answers a rejected request with `success: false` and HTTP 400, so the literal
// is what turns an error body into a thrown error.
const fxRatesResponse = z.object({
  success: z.literal(true),
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number()),
})

type FxRatesAPIResponse = z.infer<typeof fxRatesResponse>

const fetcher: Fetcher<FxRatesAPIResponse> = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok)
      throw new TypeError('Unsuccessful response from API', { cause: res })
    return fxRatesResponse.parse(await res.json())
  })

export function useCurrencyRate(
  date: Date,
  baseCurrency: string,
  targetCurrency: string,
) {
  const dateString = dayjs(date).format('YYYY-MM-DD')

  // `historical` refuses a date it does not have yet, and an expense dated
  // tomorrow is ordinary. The latest rate is the closest answer there is, and
  // the date it comes back with is what marks it as being for another day.
  const path =
    dateString > dayjs().format('YYYY-MM-DD')
      ? 'latest?'
      : `historical?date=${dateString}&`

  const url =
    !isNaN(date.getTime()) &&
    !!baseCurrency.length &&
    !!targetCurrency.length &&
    baseCurrency !== targetCurrency &&
    `https://api.fxratesapi.com/${path}base=${baseCurrency}&currencies=${targetCurrency}`
  const { data, error, isLoading, mutate } = useSWR<FxRatesAPIResponse>(
    url,
    fetcher,
    { shouldRetryOnError: false, revalidateOnFocus: false },
  )

  if (data) {
    let exchangeRate = undefined
    let sentError = error
    // The API dates its answer as a full timestamp; only the day is comparable.
    const answeredFor = data.date.slice(0, 10)
    if (!error && answeredFor !== dateString) {
      sentError = new RangeError(answeredFor)
    }
    if (data.rates[targetCurrency]) {
      // A dong rate arrives with twelve decimals of noise. Eight significant
      // digits keeps a rate near 26,000 and one near 0.86 equally usable, both
      // in the notice and in the field a custom rate is typed into.
      exchangeRate = Number(data.rates[targetCurrency].toPrecision(8))
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
