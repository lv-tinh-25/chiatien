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
      <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
      <Drawer.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[1.5rem] border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-sheet outline-none',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-border" />
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  )
}
