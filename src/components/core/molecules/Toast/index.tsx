'use client'

import { Button } from '@/components/core/atoms/Button'
import { useToastStore } from '@/stores/useToastStore'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

const DURATION = 8_000

export function ToastViewport() {
  const t = useTranslations('Toast')
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <ToastPrimitive.Provider duration={DURATION} swipeDirection="right">
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) dismiss(toast.id)
          }}
          className="flex items-start gap-3 rounded-card border border-border bg-card p-4 shadow-sheet data-[state=closed]:opacity-0"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastPrimitive.Title className="text-headline-sm text-foreground">
              {toast.title}
            </ToastPrimitive.Title>
            {toast.description !== undefined && (
              <ToastPrimitive.Description className="text-body-sm text-muted-foreground">
                {toast.description}
              </ToastPrimitive.Description>
            )}
          </div>

          {toast.action !== undefined && (
            <ToastPrimitive.Action
              altText={toast.action.altLabel}
              onClick={toast.action.onAction}
              asChild
            >
              <Button variant="outline" size="sm">
                {toast.action.label}
              </Button>
            </ToastPrimitive.Action>
          )}

          <ToastPrimitive.Close asChild>
            <Button variant="ghost" size="icon" aria-label={t('dismiss')}>
              <X aria-hidden />
            </Button>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed inset-x-4 bottom-[calc(var(--spacing-thumb-safe)+0.75rem)] z-50 flex flex-col gap-2 lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96" />
    </ToastPrimitive.Provider>
  )
}
