import { ExpenseListSkeleton } from '@/components/core/templates/ExpenseList/Skeleton'

/**
 * Shown while the route's own payload is still arriving, before the page can
 * mount and start its query. Without it a slow connection leaves the previous
 * screen on display with nothing to say a new one is coming.
 */
export default function Loading() {
  return <ExpenseListSkeleton />
}
