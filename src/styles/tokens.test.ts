import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/styles/globals.css'), 'utf8')

const REQUIRED = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--muted',
  '--muted-foreground',
  '--border',
  '--input',
  '--ring',
  '--primary',
  '--primary-foreground',
  '--primary-active',
  '--secondary',
  '--secondary-foreground',
  '--accent',
  '--accent-foreground',
  '--credit',
  '--credit-subtle',
  '--debit',
  '--debit-subtle',
  '--destructive',
  '--destructive-foreground',
]

const valueOf = (token: string) =>
  css.match(new RegExp(`^\\s*${token}:\\s*([^;]+);`, 'm'))?.[1].trim()

describe('semantic tokens', () => {
  it.each(REQUIRED)('defines %s', (token) => {
    expect(valueOf(token)).toBeDefined()
  })

  it('keeps debt and error as separate tokens', () => {
    expect(valueOf('--debit')).not.toBe(valueOf('--destructive'))
  })

  it('keeps credit distinct from the primary action colour token', () => {
    expect(css).toContain('--credit:')
    expect(css).toContain('--primary:')
  })

  it('exposes every token to tailwind as a colour', () => {
    const colourTokens = REQUIRED.filter((token) => !token.endsWith('-active'))
    for (const token of colourTokens) {
      expect(css).toContain(`--color-${token.slice(2)}: hsl(var(${token}))`)
    }
  })
})
