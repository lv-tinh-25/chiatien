import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/utils'
import type { ReactElement } from 'react'

/**
 * The one place in this codebase that writes colour literally. A national flag
 * is specified by its own law, not by this design system: making its red a
 * theme token would invite a redesign to change it, and a flag that follows the
 * palette is no longer the flag.
 *
 * Drawn rather than written as emoji, because Windows ships no flag glyphs at
 * all — there 🇻🇳 renders as the letters VN.
 *
 * The stars on the American flag are a stylised four rows rather than the
 * official fifty: at the size this is read, fifty is a grey smear.
 */
const FLAGS: Record<Locale, ReactElement> = {
  vi: (
    <>
      <rect width="24" height="24" fill="#DA251D" />
      <path
        fill="#FF0"
        d="M12.00,4.80 13.66,9.71 18.85,9.78 14.69,12.87 16.23,17.82 12.00,14.83 7.77,17.82 9.31,12.87 5.15,9.78 10.34,9.71Z"
      />
    </>
  ),
  'en-US': (
    <>
      <rect width="24" height="24" fill="#FFF" />
      {[0, 3.692, 7.385, 11.077, 14.769, 18.462, 22.154].map((y) => (
        <rect key={y} y={y} width="24" height="1.846" fill="#B22234" />
      ))}
      <rect width="11" height="12.923" fill="#3C3B6E" />
      {[1.9, 4.6, 7.3, 10].map((y, row) =>
        [1.7, 4.3, 6.9, 9.5]
          .slice(0, row % 2 === 0 ? 4 : 3)
          .map((x) => (
            <circle
              key={`${x}-${y}`}
              cx={row % 2 === 0 ? x : x + 1.3}
              cy={y}
              r="0.75"
              fill="#FFF"
            />
          )),
      )}
    </>
  ),
}

export function Flag({
  locale,
  className,
}: {
  locale: Locale
  className?: string
}) {
  return (
    // Two flags of very different proportions read as two different sizes side
    // by side, so both are cropped to the same circle by the box rather than by
    // an SVG clip path — an id would collide the moment two render at once.
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('shrink-0 overflow-hidden rounded-full', className)}
    >
      {FLAGS[locale]}
    </svg>
  )
}
