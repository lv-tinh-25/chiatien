'use client'

import { useNavigationStore } from '@/stores/useNavigationStore'
import { useRouter } from 'next/navigation'

/**
 * How a submitted form gets off the screen.
 *
 * The form's own history entry is spent, so it must not survive: leaving it
 * behind is what made the back button walk create → list → create. Stepping
 * back is preferred over replacing because it also removes the duplicate of the
 * destination that a replace would leave stacked on the entry below.
 */
export function useLeaveForm() {
  const router = useRouter()
  const previous = useNavigationStore((state) => state.previous)

  return (destination: string) => {
    if (previous === destination) {
      router.back()
      return
    }
    router.replace(destination)
  }
}
