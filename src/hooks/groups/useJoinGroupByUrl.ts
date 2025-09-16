'use client'

import { groupIdFromUrl } from '@/lib/group-url'
import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { useToastStore } from '@/stores/useToastStore'
import { trpc } from '@/trpc/client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

/** Which sentence the field shows, or none. */
export type JoinError = 'malformed' | 'notFound' | null

/**
 * Remembers a group from a link and opens it.
 *
 * Opening it is the point: a link is how someone is invited, and landing on
 * the list they came from leaves them to hunt for the card that just appeared.
 * The group screen also asks who they are, which is what actually joins them.
 */
export function useJoinGroupByUrl() {
  const t = useTranslations('Groups.AddByURL')
  const router = useRouter()
  const utils = trpc.useUtils()
  const groups = useRecentGroupsStore((state) => state.groups)
  const visit = useRecentGroupsStore((state) => state.visit)
  const show = useToastStore((state) => state.show)

  const [value, setValue] = useState('')
  const [error, setError] = useState<JoinError>(null)
  const [joining, startJoining] = useTransition()

  const join = (candidate: string) => {
    const groupId = groupIdFromUrl(candidate)
    if (groupId === null) {
      setError('malformed')
      return
    }

    startJoining(async () => {
      const details = await utils.groups.get
        .fetch({ groupId })
        .catch(() => null)
      if (!details?.group) {
        setError('notFound')
        return
      }

      // Read before `visit`, which is what makes it known.
      const known = groups.some((group) => group.id === groupId)
      visit({ id: details.group.id, name: details.group.name })
      setValue('')
      setError(null)
      show({
        title: known
          ? t('alreadyJoined', { name: details.group.name })
          : t('joined', { name: details.group.name }),
        variant: known ? 'neutral' : 'success',
      })
      router.push(`/groups/${groupId}/expenses`)
    })
  }

  return {
    value,
    error,
    joining,
    change: (next: string) => {
      setValue(next)
      setError(null)
    },
    submit: () => join(value),
    /** A scan arrives complete, so it bypasses the field entirely. */
    scanned: (text: string) => join(text),
  }
}
