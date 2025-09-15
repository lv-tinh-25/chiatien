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
      {/* Two corners, because the two screens have different empty space. A
          phone's bottom edge belongs to the nav and the FAB, so a full-width
          card there would have to sit above both and end up mid-screen; the
          top, under the bar, is the one place nothing else floats. A desktop
          has the whole bottom-right corner free.

          z-60 outranks the z-50 every scrim in the app shares: creating a group
          opens ActiveUserPrompt over the toast that confirms it, and on the
          same layer the later portal wins and swallows the message whole. The
          other half of that problem is solved on the card itself. */}
      <ToastPrimitive.Viewport className="fixed inset-x-4 top-16 z-60 flex flex-col gap-2.5 lg:top-auto lg:right-4 lg:bottom-4 lg:left-auto lg:w-96" />
    </ToastPrimitive.Provider>
  )
}
