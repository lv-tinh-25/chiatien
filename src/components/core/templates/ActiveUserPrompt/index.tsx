'use client'

import { Button } from '@/components/core/atoms/Button'
import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { useActiveUserStore } from '@/stores/useActiveUserStore'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

/**
 * Asks a first-time visitor which participant they are, so the app can show
 * their own share on every expense. Opens once per group and never again: the
 * answer, including declining to answer, is recorded.
 */
export function ActiveUserPrompt() {
  const t = useTranslations('Expenses.ActiveUserModal')
  const { groupId, group } = useCurrentGroup()
  const hydrated = useActiveUserStore((state) => state.hydrated)
  const suppressed = useActiveUserStore((state) => state.suppressPrompt)
  const answered = useActiveUserStore(
    (state) => state.activeUsers[groupId] !== undefined,
  )
  const setActiveUser = useActiveUserStore((state) => state.setActiveUser)
  const [choice, setChoice] = useState<string | null>(null)

  const open = hydrated && !suppressed && !answered && group !== null
  if (!open) return null

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 max-h-[80dvh] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto solid-overlay rounded-card p-5">
          <DialogPrimitive.Title className="text-headline-md text-foreground">
            {t('title')}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-body-md text-muted-foreground">
            {t('description')}
          </DialogPrimitive.Description>

          <fieldset className="mt-4 flex flex-col">
            {group.participants.map((participant) => (
              <label
                key={participant.id}
                className="flex min-h-touch-min items-center gap-3 text-body-lg text-foreground"
              >
                <input
                  type="radio"
                  name="activeUser"
                  className="size-4 accent-primary"
                  checked={choice === participant.id}
                  onChange={() => setChoice(participant.id)}
                />
                {participant.name}
              </label>
            ))}
            <label className="flex min-h-touch-min items-center gap-3 text-body-lg text-muted-foreground">
              <input
                type="radio"
                name="activeUser"
                className="size-4 accent-primary"
                checked={choice === null}
                onChange={() => setChoice(null)}
              />
              {t('nobody')}
            </label>
          </fieldset>

          <Button
            className="mt-5 w-full"
            onClick={() => setActiveUser(groupId, choice)}
          >
            {t('save')}
          </Button>

          <p className="mt-3 text-body-sm text-muted-foreground">
            {t('footer')}
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
