import { conversionRateNotice } from '@/lib/conversion-rate-notice'

const base = {
  isLoading: false,
  hasDate: true,
  usingCustomRate: false,
  rate: 1.25,
  error: null,
  originalCode: 'EUR',
  groupCode: 'USD',
}

const keys = (notice: ReturnType<typeof conversionRateNotice>) =>
  notice.messages.map((message) => message.key)

describe('conversionRateNotice', () => {
  it('asks for a date before anything else', () => {
    const notice = conversionRateNotice({ ...base, hasDate: false })
    expect(keys(notice)).toEqual(['noDate'])
    expect(notice.display).toBeNull()
  })

  it('says nothing about the API while a custom rate is in use', () => {
    expect(keys(conversionRateNotice({ ...base, usingCustomRate: true }))).toEqual(
      ['customRate'],
    )
  })

  it('reports the fetch in flight', () => {
    expect(keys(conversionRateNotice({ ...base, isLoading: true }))).toEqual([
      'loading',
    ])
  })

  it('shows the rate it obtained', () => {
    const notice = conversionRateNotice(base)
    expect(keys(notice)).toEqual(['success'])
    expect(notice.display).toBe('EUR 1 = USD 1.25')
  })

  it('names the date the API answered for, and marks the rate stale', () => {
    const notice = conversionRateNotice({
      ...base,
      error: new RangeError('2026-09-04'),
    })
    expect(notice.messages).toEqual([
      { key: 'dateMismatch', values: { date: '2026-09-04' } },
      { key: 'staleRate' },
    ])
    expect(notice.display).toBe('EUR 1 = USD 1.25')
  })

  it('asks for a custom rate when the failed lookup left nothing behind', () => {
    expect(
      keys(
        conversionRateNotice({
          ...base,
          rate: undefined,
          error: new Error('offline'),
        }),
      ),
    ).toEqual(['error', 'noRate'])
  })

  it('treats a date mismatch with no rate as a plain error', () => {
    expect(
      keys(
        conversionRateNotice({
          ...base,
          rate: undefined,
          error: new RangeError('2026-09-04'),
        }),
      ),
    ).toEqual(['error', 'noRate'])
  })

  it('reports a currency the API does not know', () => {
    expect(keys(conversionRateNotice({ ...base, rate: undefined }))).toEqual([
      'currencyNotFound',
    ])
  })
})
