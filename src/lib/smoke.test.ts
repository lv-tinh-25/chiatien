import { cn } from '@/lib/utils'

describe('toolchain', () => {
  it('resolves the @/ path alias', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
})
