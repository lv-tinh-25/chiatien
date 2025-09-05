import {
  defaultLocale,
  displayLocale,
  localeLabels,
  locales,
} from '@/i18n/locales'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'messages')

const flatten = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([key, nested]) =>
        flatten(nested, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix]

const keysOf = (locale: string) =>
  readdirSync(join(dir, locale))
    .flatMap((file) =>
      flatten(JSON.parse(readFileSync(join(dir, locale, file), 'utf8'))).map(
        (key) => `${file}:${key}`,
      ),
    )
    .sort()

describe('messages', () => {
  it('offers Vietnamese in the locale switcher', () => {
    expect(locales).toContain('vi')
    expect(localeLabels.vi).toBe('Tiếng Việt')
  })

  it('merges every locale on top of English', () => {
    expect(defaultLocale).toBe('en-US')
  })

  it('shows Vietnamese to a browser that states no preference', () => {
    expect(displayLocale).toBe('vi')
  })

  it('splits every locale into the same namespaces', () => {
    for (const locale of locales) {
      expect(readdirSync(join(dir, locale)).sort()).toEqual([
        'balances.json',
        'common.json',
        'errors.json',
        'expenses.json',
        'groups.json',
        'stats.json',
      ])
    }
  })

  it('defines every English key in Vietnamese', () => {
    const vietnamese = new Set(keysOf('vi'))
    const missing = keysOf('en-US').filter((key) => !vietnamese.has(key))
    expect(missing).toEqual([])
  })
})
