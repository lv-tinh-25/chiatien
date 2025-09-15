'use client'

import { useToastStore } from '@/stores/useToastStore'

type Outcome<T> = { ok: true; value: T } | { ok: false }

/**
 * Reports what happened to a mutation, and tells the caller whether to carry
 * on. Navigating away on a failure would hide the error along with the form
 * the user still has to fix, so the outcome is the gate.
 */
export function useMutationFeedback() {
  const show = useToastStore((state) => state.show)

  return {
    run: async <T>(
      action: () => Promise<T>,
      messages: { success: string; failure: string },
    ): Promise<Outcome<T>> => {
      try {
        const value = await action()
        show({ title: messages.success, variant: 'success' })
        return { ok: true, value }
      } catch {
        // The reason is not shown: a tRPC error message is written for a
        // developer, and the recovery is the same whatever it says.
        show({ title: messages.failure, variant: 'error' })
        return { ok: false }
      }
    },
  }
}
