import { initialsOf } from '@/components/core/atoms/Avatar/initials'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const atomsDir = join(process.cwd(), 'src/components/core/atoms')

describe('initialsOf', () => {
  it('takes the first letter of the first and last word', () => {
    expect(initialsOf('Nguyễn Văn Nam')).toBe('NN')
  })

  it('takes two letters from a single word', () => {
    expect(initialsOf('Nam')).toBe('NA')
  })

  it('uppercases and keeps diacritics', () => {
    expect(initialsOf('đức minh')).toBe('ĐM')
  })

  it('collapses repeated whitespace', () => {
    expect(initialsOf('  Thảo   My  ')).toBe('TM')
  })

  it('returns a placeholder for an empty name', () => {
    expect(initialsOf('   ')).toBe('?')
  })
})

describe('atom styling', () => {
  const files = readdirSync(atomsDir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('index.tsx'))
    .map((file) => join(atomsDir, file))

  it('finds every atom', () => {
    expect(files).toHaveLength(8)
  })

  it.each(files)('%s uses no hardcoded colour', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/\brgba?\(/)
    expect(source).not.toMatch(
      /\b(bg|text|border|ring)-(red|green|blue|slate|gray|zinc|emerald|sky|amber|neutral|stone)-\d{2,3}\b/,
    )
  })
})
