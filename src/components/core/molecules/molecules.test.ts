import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'src/components/core/molecules')

const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('index.tsx'))
  .map((file) => join(dir, file))

describe('molecule styling', () => {
  it('finds every molecule', () => {
    expect(files).toHaveLength(6)
  })

  it.each(files)('%s uses no hardcoded colour', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/\brgba?\(/)
    expect(source).not.toMatch(
      /\b(bg|text|border|ring)-(red|green|blue|slate|gray|zinc|emerald|sky|amber|neutral|stone)-\d{2,3}\b/,
    )
  })

  it.each(files)('%s hardcodes no display sentence', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source).not.toMatch(/>[A-Z][a-z]+ [a-z]+/)
  })
})
