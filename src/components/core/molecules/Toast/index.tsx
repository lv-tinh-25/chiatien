'use client'

import { ToastCard } from '@/components/core/molecules/Toast/ToastCard'
import { useToastStore } from '@/stores/useToastStore'
import * as ToastPrimitive from '@radix-ui/react-toast'

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(({ id, ...toast }) => (
        <ToastCard key={id} {...toast} onDismiss={() => dismiss(id)} />
      ))}
      {/* Above the FAB, which already sits above the bottom nav — on a phone
          the card spans the width, so the lowest floating thing on screen sets
          the floor for all of it, not just its right end.

          z-60 outranks the z-50 every scrim in the app shares: creating a group
          opens ActiveUserPrompt over the toast that confirms it, and on the
          same layer the later portal wins and swallows the message whole. The
          other half of that problem is solved on the card itself. */}
      <ToastPrimitive.Viewport className="fixed inset-x-4 bottom-fab-safe z-60 flex flex-col gap-2.5 lg:right-4 lg:bottom-4 lg:left-auto lg:w-96" />
    </ToastPrimitive.Provider>
  )
}
