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
      // Oldest first, so reading order and focus order both run top to bottom.
      // The viewport is anchored to the bottom edge, which puts the newest
      // toast nearest it and lifts the older ones out of the way.
      toasts: [...state.toasts, { ...toast, id: nanoid() }].slice(-MAX_VISIBLE),
    })),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
