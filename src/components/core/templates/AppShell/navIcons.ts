import type { NavKey } from '@/components/core/templates/AppShell/navigation'
import {
  BarChart3,
  History,
  Info,
  Receipt,
  Scale,
  type LucideIcon,
} from 'lucide-react'

export const NAV_ICONS: Record<NavKey, LucideIcon> = {
  expenses: Receipt,
  balances: Scale,
  stats: BarChart3,
  activity: History,
  information: Info,
}
