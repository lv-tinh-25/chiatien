'use client'

import { Input } from '@/components/core/atoms/Input'
import {
  amountSeparators,
  caretAfterFormat,
  formatAmountForInput,
  parseAmountInput,
  significantBeforeCaret,
} from '@/lib/currency-input'
import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
} from 'react'

type AmountInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  /** The raw value the form holds. Never grouped — grouping is for reading. */
  value: string | number | null | undefined
  onValueChange: (raw: string) => void
  locale: string
}

/**
 * The one money field. It shows an amount grouped the way its reader writes
 * numbers and hands the form a bare one, so nothing downstream has to know that
 * a thousands mark and a decimal point are the same character in Vietnamese.
 *
 * The caret is put back by hand after every keystroke: React rewrites the whole
 * value, and the browser would otherwise drop the caret at the end as soon as a
 * group boundary is crossed.
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput({ value, onValueChange, locale, ...props }, forwarded) {
    const separators = amountSeparators(locale)
    const input = useRef<HTMLInputElement | null>(null)
    const caret = useRef<number | null>(null)

    useLayoutEffect(() => {
      if (caret.current === null) return
      input.current?.setSelectionRange(caret.current, caret.current)
      caret.current = null
    })

    return (
      <Input
        {...props}
        inputMode="decimal"
        ref={(node) => {
          input.current = node
          if (typeof forwarded === 'function') forwarded(node)
          else if (forwarded) forwarded.current = node
        }}
        value={formatAmountForInput(String(value ?? ''), separators)}
        onChange={(event) => {
          const typed = event.target.value
          const significant = significantBeforeCaret(
            typed,
            event.target.selectionStart ?? typed.length,
            separators,
          )
          const raw = parseAmountInput(typed, separators)
          caret.current = caretAfterFormat(
            formatAmountForInput(raw, separators),
            significant,
            separators,
          )
          onValueChange(raw)
        }}
      />
    )
  },
)
