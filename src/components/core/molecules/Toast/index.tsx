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
      {/* Hangs below whichever top bar is on screen — 56px on a phone, 60px on
          a desktop — so a report never covers the title of what it reports on.

          Above z-50, which every scrim in the app shares: creating a group
          opens ActiveUserPrompt over the toast that confirms it, and on the
          same layer the later portal wins and swallows both the message and
          its close button.

          The second half of that problem is solved on the card itself. */}
      <ToastPrimitive.Viewport className="fixed inset-x-4 top-16 z-60 flex flex-col gap-2.5 lg:top-17 lg:right-4 lg:left-auto lg:w-96" />
    </ToastPrimitive.Provider>
  )
}
