'use client'

import { Button } from '@/components/core/atoms/Button'
import { cn } from '@/lib/utils'
import { useToastStore, type Toast } from '@/stores/useToastStore'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { Check, Info, TriangleAlert, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

const DURATION = 8_000

/**
 * What each outcome looks like.
 *
 * The colour is carried by a mark and a rail rather than by the card's own
 * border: `glass-float` sets the `border` shorthand, so a coloured border is
 * overwritten by the surface it sits on. A filled mark is the stronger signal
 * anyway — it states the outcome before the sentence has been read.
 */
const MARKS = {
  success: {
    Icon: Check,
    mark: 'bg-credit text-primary-foreground',
    rail: 'bg-credit',
  },
  error: {
    Icon: TriangleAlert,
    mark: 'bg-destructive text-destructive-foreground',
    rail: 'bg-destructive',
  },
  neutral: {
    Icon: Info,
    mark: 'bg-muted text-muted-foreground',
    rail: 'bg-border',
  },
} as const

function markFor(variant: Toast['variant']) {
  if (variant === 'success') return MARKS.success
  if (variant === 'error') return MARKS.error
  return MARKS.neutral
}

export function ToastViewport() {
  const t = useTranslations('Toast')
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <ToastPrimitive.Provider duration={DURATION} swipeDirection="right">
      {toasts.map((toast) => {
        const { Icon, mark, rail } = markFor(toast.variant)

        return (
          <ToastPrimitive.Root
            key={toast.id}
            open
            // A failure has to interrupt; a confirmation must not.
            type={toast.variant === 'error' ? 'foreground' : 'background'}
            onOpenChange={(open) => {
              if (!open) dismiss(toast.id)
            }}
            className={cn(
              'glass-float rise-in relative flex items-start gap-3 overflow-hidden rounded-card py-3 pr-2 pl-4',
              'transition-[opacity,transform] duration-200 ease-out-soft',
              'data-[state=closed]:opacity-0',
              'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
              'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=cancel]:translate-x-0',
            )}
          >
            <span
              aria-hidden
              className={cn('absolute inset-y-0 left-0 w-1', rail)}
            />

            <span
              aria-hidden
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full',
                mark,
              )}
            >
              <Icon className="size-4" strokeWidth={2.75} />
            </span>

            {/* The action sits under the sentence rather than beside it: on a
                phone-width card the two together leave the description three
                words to a line. */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <ToastPrimitive.Title className="text-body-lg font-bold text-foreground">
                {toast.title}
              </ToastPrimitive.Title>
              {toast.description !== undefined && (
                <ToastPrimitive.Description className="text-body-sm text-muted-foreground">
                  {toast.description}
                </ToastPrimitive.Description>
              )}
              {toast.action !== undefined && (
                <ToastPrimitive.Action
                  altText={toast.action.altLabel}
                  onClick={toast.action.onAction}
                  asChild
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1.5 self-start"
                  >
                    {toast.action.label}
                  </Button>
                </ToastPrimitive.Action>
              )}
            </div>

            <ToastPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('dismiss')}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden className="size-4" />
              </Button>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
      <ToastPrimitive.Viewport className="fixed inset-x-4 bottom-[calc(var(--spacing-thumb-safe)+0.75rem)] z-50 flex flex-col gap-2 lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96" />
    </ToastPrimitive.Provider>
  )
}
