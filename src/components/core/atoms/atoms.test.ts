import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const atomsDir = join(process.cwd(), 'src/components/core/atoms')

describe('atom styling', () => {
  const files = readdirSync(atomsDir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('index.tsx'))
    .map((file) => join(atomsDir, file))

  it('finds the atoms to check', () => {
    // Not an exact count: this only proves the glob resolved, so adding an
    // atom does not fail an unrelated assertion.
    expect(files.length).toBeGreaterThan(0)
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
