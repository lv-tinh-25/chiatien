'use client'

import { nanoid } from 'nanoid'
import { create } from 'zustand'

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
  /** Absent keeps the neutral card the undo toasts use. */
  variant?: 'success' | 'error'
}

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
    set((state) => ({ toasts: [...state.toasts, { ...toast, id: nanoid() }] })),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
