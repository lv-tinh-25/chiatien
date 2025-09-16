'use client'

import { parentOf } from '@/components/core/templates/AppShell/navigation'
import { usePathname } from 'next/navigation'

/** Where this screen's back affordance points, or null where it has none. */
export function useParentPath(): string | null {
  return parentOf(usePathname())
}
