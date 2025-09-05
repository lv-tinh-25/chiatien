'use client'

import { Button } from '@/components/core/atoms/Button'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

type ConfirmDialogProps = {
  trigger: ReactNode
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-5 shadow-sheet">
          <DialogPrimitive.Title className="text-headline-md text-foreground">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-2 text-body-md text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <DialogPrimitive.Close asChild>
              <Button variant="ghost">{cancelLabel}</Button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close asChild>
              <Button
                variant={destructive ? 'destructive' : 'primary'}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
