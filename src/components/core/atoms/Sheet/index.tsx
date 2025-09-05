'use client'

import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Drawer } from 'vaul'

export const Sheet = Drawer.Root
export const SheetTrigger = Drawer.Trigger
export const SheetClose = Drawer.Close
export const SheetTitle = Drawer.Title
export const SheetDescription = Drawer.Description

export function SheetContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Drawer.Content> & { children: ReactNode }) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="glass-scrim fixed inset-0 z-50" />
      <Drawer.Content
        className={cn(
          'glass-modal fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-sheet border-b-0 pb-[env(safe-area-inset-bottom)] outline-none',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-foreground/15" />
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  )
}
