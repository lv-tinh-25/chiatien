'use client'

import {
  useFormState,
  type Control,
  type FieldErrors,
  type FieldValues,
} from 'react-hook-form'

/**
 * `form.formState` is a Proxy whose getters are what subscribe a component to
 * the fields it reads. The React Compiler caches that read, so a component
 * touching `form.formState.errors` directly never re-subscribes: it keeps
 * rendering the errors computed for the *previous* keystroke, which is why a
 * corrected field went on showing "enter at least two characters".
 *
 * `useFormState` re-reads the proxy on every render of its own hook and hands
 * back a fresh object, which the compiler cannot cache away.
 */
export function useFormErrors<
  TFieldValues extends FieldValues,
  TTransformedValues,
>(
  control: Control<TFieldValues, unknown, TTransformedValues>,
): FieldErrors<TFieldValues> {
  return useFormState({ control }).errors
}
