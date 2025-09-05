import { Plus_Jakarta_Sans } from 'next/font/google'

// The `vietnamese` subset is required, not cosmetic: without it accented glyphs
// fall back to a different face and sit on a different baseline.
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-jakarta',
  display: 'swap',
})
