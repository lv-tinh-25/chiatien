import { AppShell } from '@/components/core/templates/AppShell'
import type { ReactNode } from 'react'

export default function GroupsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
