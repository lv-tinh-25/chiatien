'use client'

import { Button } from '@/components/core/atoms/Button'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useState, type ReactNode } from 'react'

type ConfirmDialogProps = {
  trigger: ReactNode
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}

/**
 * The dialog, not the caller, is what stops a second confirmation: closing on
 * click would put the trigger back under the user's finger while the request is
 * still in flight, and a second delete answers 500. So it stays open and
 * disabled until the promise settles.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const confirm = async () => {
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next)
      }}
    >
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="glass-scrim fixed inset-0 z-50" />
        <DialogPrimitive.Content className="solid-overlay fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card p-5">
          <DialogPrimitive.Title className="text-headline-md text-foreground">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-2 text-body-md text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-5 flex justify-end gap-2">
            {/* Inert while the request runs, but without a spinner of its own:
                only one control is busy. */}
            <Button
              variant="ghost"
              aria-disabled={pending || undefined}
              className={pending ? 'pointer-events-none opacity-50' : undefined}
              onClick={() => {
                if (!pending) setOpen(false)
              }}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              pending={pending}
              onClick={() => void confirm()}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
