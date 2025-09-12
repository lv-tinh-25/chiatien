'use client'

import type { LucideIcon } from 'lucide-react'
import { nanoid } from 'nanoid'
import { create } from 'zustand'

/**
 * How the toast reads, and — because the unsafe combination is the easy one to
 * write by accident — how long it stays. `ToastCard` owns that mapping.
 */
export type ToastVariant = 'neutral' | 'success' | 'warning' | 'error'

export type ToastAction = {
  label: string
  /** Announced by assistive technology in place of the visual label. */
  altLabel: string
  onAction: () => void
}

export type Toast = {
  id: string
  title: string
  description?: string
  action?: ToastAction
  /** Overrides the variant's glyph when the action itself has a better one. */
  icon?: LucideIcon
  /** Absent is `neutral`: something happened, and it was neither good nor bad. */
  variant?: ToastVariant
}

/** Past this the stack covers the screen it is reporting on. */
const MAX_VISIBLE = 4

type ToastState = {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

/**
 * Deliberately not persisted: a toast reports something that just happened, so
 * surviving a reload would make it lie.
 */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (toast) =>
    set((state) => ({
      // Newest first. The viewport hangs from the top edge, so a new toast
      // arrives where the eye already is and pushes the older ones down.
      toasts: [{ ...toast, id: nanoid() }, ...state.toasts].slice(
        0,
        MAX_VISIBLE,
      ),
    })),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
